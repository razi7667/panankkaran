const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  try {
    const customId = interaction.customId;
    const type = customId.split('_')[1]; // 'expense' or 'income'

    const amount = interaction.fields.getTextInputValue('amountInput');
    const balance = interaction.fields.getTextInputValue('balanceInput');

    let channelId;
    if (type === 'expense') {
      channelId = process.env.CHANNEL_EXPENSE;
    } else if (type === 'income') {
      channelId = process.env.CHANNEL_INCOME;
    } else {
      return interaction.reply({ content: 'Something went wrong. Invalid transaction type.', ephemeral: true });
    }

    const targetChannel = await interaction.client.channels.fetch(channelId);
    if (!targetChannel) {
      return interaction.reply({ content: 'Target channel not found.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(type === 'expense' ? '💸 Expense Recorded' : '💰 Income Recorded')
      .addFields(
        { name: 'Amount', value: `₹${amount}`, inline: true },
        { name: 'Available Balance', value: `₹${balance}`, inline: true },
        { name: 'Submitted By', value: `<@${interaction.user.id}>` }
      )
      .setColor(type === 'expense' ? 0xE74C3C : 0x2ECC71)
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });

    await interaction.reply({ content: '✅ Submitted and forwarded successfully!', ephemeral: true });
  } catch (error) {
    console.error('Modal Submission Error:', error);
    await interaction.reply({ content: '❌ Something went wrong while submitting.', ephemeral: true });
  }
};
