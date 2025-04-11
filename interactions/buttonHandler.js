const botWakeService = require('../services/botWakeService');

module.exports = async function handleButton(interaction) {
  if (interaction.customId === 'wake_button') {
    await botWakeService.wakeBot(interaction);
  }
};