const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    InteractionResponseFlags,
  } = require('discord.js');
  
  const { createTransactionDropdown } = require('../services/transactionService');
  
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
  
        const row1 = new ActionRowBuilder().addComponents(amountInput);
        const row2 = new ActionRowBuilder().addComponents(balanceInput);
  
        modal.addComponents(row1, row2);
        await interaction.showModal(modal);
      } else {
        await interaction.reply({
          content: '🚧 This option is not available yet.',
          flags: 64, // ephemeral
        });
      }
  
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
  
    // Handle modal submission
    if (interaction.isModalSubmit()) {
      try {
        const customId = interaction.customId;
        const type = customId.split('_')[1]; // 'expense' or 'income'
  
        const amount = interaction.fields.getTextInputValue('amountInput');
        const balance = interaction.fields.getTextInputValue('balanceInput');
  
        let targetChannelId;
        if (type === 'expense') {
          targetChannelId = process.env.CHANNEL_EXPENSE;
        } else if (type === 'income') {
          targetChannelId = process.env.CHANNEL_INCOME;
        } else {
          return;
        }
  
        const embed = new EmbedBuilder()
          .setTitle(type === 'expense' ? '💸 Expense Recorded' : '💰 Income Recorded')
          .addFields(
            { name: 'Amount', value: `₹${amount}`, inline: true },
            { name: 'Available Balance', value: `₹${balance}`, inline: true }
          )
          .setColor(type === 'expense' ? 0xe74c3c : 0x2ecc71)
          .setTimestamp()
          .setFooter({ text: 'Powered by Muhammed Razi™' });
  
        const mainChannel = await interaction.client.channels.fetch(targetChannelId);
        const transactionChannel = await interaction.client.channels.fetch(process.env.CHANNEL_TRANSACTIONS);
  
        if (mainChannel) await mainChannel.send({ embeds: [embed] });
        if (transactionChannel) await transactionChannel.send({ embeds: [embed] });
  
        await interaction.deferUpdate(); // acknowledges the modal submit
      } catch (err) {
        console.error('Modal Submission Error:', err);
      }
      return;
    }
  
    // Handle channel manager dropdown
    if (interaction.isStringSelectMenu() && interaction.customId === 'channel_manager_select') {
      const selectedChannelId = interaction.values[0];
      const targetChannel = await interaction.client.channels.fetch(selectedChannelId);
  
      if (!targetChannel || targetChannel.type !== 0) {
        await interaction.reply({
          content: '⚠️ Invalid channel selected.',
          flags: 64,
        });
        return;
      }
  
      await interaction.deferReply({ flags: 64 }); // reply only once
  
      setTimeout(async () => {
        try {
          let deleted = 0;
          let messages;
  
          do {
            messages = await targetChannel.messages.fetch({ limit: 100 });
            const deletable = messages.filter(msg => !msg.pinned);
            if (deletable.size > 0) {
              await targetChannel.bulkDelete(deletable, true);
              deleted += deletable.size;
            }
          } while (messages.size >= 2);
  
          await interaction.editReply({
            content: `✅ Cleared **${deleted}** messages in <#${selectedChannelId}>`,
          });
        } catch (err) {
          console.error('Delete Error:', err);
          await interaction.editReply({
            content: '❌ Failed to delete messages. Make sure I have `MANAGE_MESSAGES` permission.',
          });
        }
      }, 3000);
    }
  };
  