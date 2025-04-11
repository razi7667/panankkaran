const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require('discord.js');
  
  function getStatusEmbedRow(isOnline) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: 'Panakkaran Bot Status',
        iconURL: 'https://i.postimg.cc/WzPRxSh7/panakkaran-logo.png',
      })
      .setColor('Red')
      .addFields({
        name: '• Status',
        value: isOnline
          ? '```🟢 Online```\n**• Uptime:** <t:' + Math.floor(Date.now() / 1000) + ':R>\n\u200B'
          : '```🟥 Offline```\n**• Uptime:** 0 seconds\n\u200B',
      })
      .setFooter({ text: 'Powered by Muhammed Razi™' })
      .setTimestamp();
  
    // 🔒 Hidden: Wake Button Setup
    /*
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('wake_up_bot')
        .setLabel(isOnline ? '✅ Already Awake' : '🔄 Wake Bot')
        .setStyle(isOnline ? ButtonStyle.Success : ButtonStyle.Primary)
        .setDisabled(isOnline)
    );
    */
  
    // Return only the embed for now
    return { embed /*, row */ };
  }
  
  async function sendStatusEmbed(channel, isOnline) {
    const { embed /*, row */ } = getStatusEmbedRow(isOnline);
    return await channel.send({
      embeds: [embed],
      // components: [row], // 🔒 Hidden: Button Holder
    });
  }
  
  async function editStatusEmbed(message, isOnline) {
    const { embed /*, row */ } = getStatusEmbedRow(isOnline);
    return await message.edit({
      embeds: [embed],
      // components: [row], // 🔒 Hidden: Button Holder
    });
  }
  
  module.exports = {
    sendStatusEmbed,
    editStatusEmbed,
  };
  