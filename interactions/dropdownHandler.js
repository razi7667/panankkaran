const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = async function handleDropdown(interaction) {
  const selected = interaction.values[0];
  const modal = new ModalBuilder()
    .setCustomId(`modal_${selected}`)
    .setTitle(`Add ${selected.charAt(0).toUpperCase() + selected.slice(1)}`);

  const amount = new TextInputBuilder()
    .setCustomId('amount')
    .setLabel('Amount')
    .setStyle(TextInputStyle.Short);

  const description = new TextInputBuilder()
    .setCustomId('description')
    .setLabel('Description')
    .setStyle(TextInputStyle.Paragraph);

  const balance = new TextInputBuilder()
    .setCustomId('balance')
    .setLabel('Available Balance')
    .setStyle(TextInputStyle.Short);

  const row1 = new ActionRowBuilder().addComponents(amount);
  const row2 = new ActionRowBuilder().addComponents(description);
  const row3 = new ActionRowBuilder().addComponents(balance);

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
};