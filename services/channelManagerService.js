const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ChannelType,
    PermissionsBitField,
  } = require('discord.js');
  
  async function sendChannelManagerDropdown(client, channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;
  
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setTitle('⚠️ Channel Manager')
      .setDescription('Select a channel to **delete all messages**.\nThis action is irreversible!')
      .setFooter({ text: 'Panakkaran Bot - Use responsibly' });
  
    const menu = new StringSelectMenuBuilder()
      .setCustomId('channel_manager_select')
      .setPlaceholder('Select a channel to wipe')
      .addOptions([
        {
          label: 'Expense Channel',
          value: process.env.CHANNEL_EXPENSE,
          emoji: '🧾',
          description: 'Delete all messages in the Expense channel',
        },
        {
          label: 'Income Channel',
          value: process.env.CHANNEL_INCOME,
          emoji: '💰',
          description: 'Delete all messages in the Income channel',
        },
        {
          label: 'Transactions Channel',
          value: process.env.CHANNEL_TRANSACTIONS,
          emoji: '📦',
          description: 'Delete all messages in the Transactions channel',
        },
        {
          label: 'Notification Channel',
          value: process.env.CHANNEL_NOTIFICATION,
          emoji: '🔔',
          description: 'Delete all messages in the Notification channel',
        },
        {
            label: 'Message Manager Channel',
            value: process.env.CHANNEL_MANAGER,
            emoji: '📩',
            description: 'Delete all messages in the Message channel',
        },
      ]);
  
    const row = new ActionRowBuilder().addComponents(menu);
    await channel.send({ embeds: [embed], components: [row] });
  }
  
  module.exports = {
    sendChannelManagerDropdown,
  };
  