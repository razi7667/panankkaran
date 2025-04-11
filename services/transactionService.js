const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

function createTransactionDropdown() {
  const embed = new EmbedBuilder()
    .setImage('https://i.postimg.cc/T1PmqhF6/a-PPLICATION.png')
    .setColor('Red');

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select_transaction')
      .setPlaceholder('Choose a transaction type')
      .addOptions([
        {
          label: '🧾 Expense',
          value: 'expense',
        },
        {
          label: '💰 Income',
          value: 'income',
        },
        {
          label: '🏦 Savings',
          value: 'savings',
        },
      ])
  );

  return { embed, row };
}

async function sendTransactionDropdown(channel) {
  const { embed, row } = createTransactionDropdown();

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessage = messages.find(msg => msg.author.bot && msg.components.length > 0);

  if (botMessage) {
    await botMessage.edit({ embeds: [embed], components: [row] });
  } else {
    await channel.send({ embeds: [embed], components: [row] });
  }
}

module.exports = {
  sendTransactionDropdown,
  createTransactionDropdown,
};
