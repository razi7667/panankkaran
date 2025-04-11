const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let lastWakeMessage; // Persisted in memory

const getEmbed = (status) => {
  const statusMap = {
    sleep: { label: '💤 Sleeping...', color: 0x808080 },
    calling: { label: '⏳ Calling bot...', color: 0xffa500 },
    ready: { label: `✅ ${process.env.BOT_NAME} is Online!`, color: 0x57f287 },
  };

  const embed = new EmbedBuilder()
    .setTitle('🤖 Bot Startup Status')
    .setColor(statusMap[status].color)
    .addFields([
      { name: 'Status', value: statusMap[status].label, inline: true },
    ])
    .setTimestamp();

  return embed;
};

const getButton = (status) => {
  const statusMap = {
    sleep: { label: 'Wake Up Bot', style: ButtonStyle.Primary, disabled: false },
    calling: { label: 'Calling Bot...', style: ButtonStyle.Primary, disabled: true },
    ready: { label: 'Online', style: ButtonStyle.Success, disabled: true },
  };

  const btn = new ButtonBuilder()
    .setCustomId('wake_bot')
    .setLabel(statusMap[status].label)
    .setStyle(statusMap[status].style)
    .setDisabled(statusMap[status].disabled);

  return new ActionRowBuilder().addComponents(btn);
};

async function sendWakeEmbed(client, options = {}) {
  const channel = client.channels.cache.find(
    (ch) => ch.name === process.env.CHANNEL_START.replace('#', '')
  );
  if (!channel) return;

  if (options.interaction) {
    // Update message with "Calling bot..."
    if (lastWakeMessage) {
      await lastWakeMessage.edit({
        embeds: [getEmbed('calling')],
        components: [getButton('calling')],
      });
    }
  } else if (options.ready) {
    // Update to "Online"
    if (lastWakeMessage) {
      await lastWakeMessage.edit({
        embeds: [getEmbed('ready')],
        components: [getButton('ready')],
      });
    }
  } else {
    // Send initial embed if not already sent
    if (!lastWakeMessage) {
      const message = await channel.send({
        embeds: [getEmbed('sleep')],
        components: [getButton('sleep')],
      });
      lastWakeMessage = message;
    }
  }
}

module.exports = { sendWakeEmbed };
