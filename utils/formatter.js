const { EmbedBuilder } = require('discord.js');

module.exports.transactionMessage = ({ type, user, amount, description, balance }) => {
  return new EmbedBuilder()
    .setTitle(`${type.toUpperCase()} Entry`)
    .addFields(
      { name: 'User', value: user, inline: true },
      { name: 'Amount', value: `₹${amount}`, inline: true },
      { name: 'Available Balance', value: `₹${balance}`, inline: true },
      { name: 'Description', value: description }
    )
    .setColor(type === 'expense' ? 0xff4d4d : type === 'income' ? 0x4caf50 : 0x2196f3)
    .setTimestamp();
};