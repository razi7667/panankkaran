const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
  } = require('discord.js');
  
  const { createTransactionDropdown } = require('../services/transactionService');
  const { editStatusEmbed } = require('../services/botWakeService');
  
  const axios = require('axios');
  require('dotenv').config();
  
  // Hardcoded Render API details (needed even if backend is offline)
  const RENDER_API_KEY = 'your_render_api_key_here';
  const RENDER_SERVICE_ID = 'your_render_service_id_here';
  
  module.exports = async (interaction) => {
    // Handle transaction dropdown
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_transaction') {
      const selected = interaction.values[0];
  
      if (selected === 'expense' || selected === 'income') {
        const modal = new ModalBuilder()
          .setCustomId(`submit_${selected}`)
          .setTitle(selected === 'expense' ? 'Add Expense' : 'Add Income');
  
        const amountInput = new TextInputBuilder()
          .setCustomId('amountInput')
          .setLabel('Amount')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
  
        const balanceInput = new TextInputBuilder()
          .setCustomId('balanceInput')
          .setLabel('Available Balance')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
  
        modal.addComponents(
          new ActionRowBuilder().addComponents(amountInput),
          new ActionRowBuilder().addComponents(balanceInput)
        );
  
        await interaction.showModal(modal);
      } else {
        await interaction.reply({
          content: '🚧 This option is not available yet.',
          ephemeral: true,
        });
      }
  
      // Reset dropdown placeholder after 1s
      setTimeout(async () => {
        try {
          const { embed, row } = createTransactionDropdown();
          await interaction.message.edit({ embeds: [embed], components: [row] });
        } catch (err) {
          console.error('Dropdown Reset Error:', err);
        }
      }, 1000);
      return;
    }
  
    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      try {
        const type = interaction.customId.split('_')[1];
        const amount = interaction.fields.getTextInputValue('amountInput');
        const balance = interaction.fields.getTextInputValue('balanceInput');
  
        let targetChannelId;
        if (type === 'expense') targetChannelId = process.env.CHANNEL_EXPENSE;
        else if (type === 'income') targetChannelId = process.env.CHANNEL_INCOME;
        else return;
  
        const embed = new EmbedBuilder()
          .setTitle(type === 'expense' ? '💸 Expense Recorded' : '💰 Income Recorded')
          .addFields(
            { name: 'Amount', value: `₹${amount}`, inline: true },
            { name: 'Available Balance', value: `₹${balance}`, inline: true }
          )
          .setColor(type === 'expense' ? 0xE74C3C : 0x2ECC71)
          .setTimestamp()
          .setFooter({ text: 'Powered by Muhammed Razi™' });
  
        const mainChannel = await interaction.client.channels.fetch(targetChannelId);
        const transactionChannel = await interaction.client.channels.fetch(process.env.CHANNEL_TRANSACTIONS);
  
        if (mainChannel) await mainChannel.send({ embeds: [embed] });
        if (transactionChannel) await transactionChannel.send({ embeds: [embed] });
  
        await interaction.deferUpdate(); // Prevent interaction fail
      } catch (err) {
        console.error('Modal Submission Error:', err);
      }
      return;
    }
  
    // Handle Wake/Sleep Buttons
    if (interaction.isButton()) {
      const { customId, message } = interaction;
  
      if (customId === 'wake_bot') {
        await interaction.reply({ content: '🚀 Deploying latest commit to Render...', ephemeral: true });
  
        try {
          await axios.post(
            `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys`,
            {},
            {
              headers: {
                Authorization: `Bearer ${RENDER_API_KEY}`,
                'Content-Type': 'application/json',
              },
            }
          );
  
          await editStatusEmbed(message, true);
        } catch (err) {
          console.error('Wake Error:', err);
          await interaction.followUp({ content: '❌ Failed to deploy on Render.', ephemeral: true });
        }
  
      } else if (customId === 'sleep_bot') {
        await interaction.reply({ content: '🛑 Stopping deployment on Render...', ephemeral: true });
  
        try {
          const { data } = await axios.get(
            `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/deploys`,
            {
              headers: { Authorization: `Bearer ${RENDER_API_KEY}` },
            }
          );
  
          const active = data.find(d => d.status === 'in_progress');
          if (active) {
            await axios.delete(
              `https://api.render.com/v1/deploys/${active.id}`,
              {
                headers: { Authorization: `Bearer ${RENDER_API_KEY}` },
              }
            );
  
            await editStatusEmbed(message, false);
          } else {
            await interaction.followUp({ content: '⚠️ No active deploy found to cancel.', ephemeral: true });
          }
        } catch (err) {
          console.error('Sleep Error:', err);
          await interaction.followUp({ content: '❌ Failed to stop deployment.', ephemeral: true });
        }
      }
      return;
    }
  };
  