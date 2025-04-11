require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const interactionRouter = require('./interactions/interactionRouter');
const {
  sendStatusEmbed,
  editStatusEmbed,
} = require('./services/botWakeService');
const {
  sendTransactionDropdown,
} = require('./services/transactionService');
const {
  sendChannelManagerDropdown,
} = require('./services/channelManagerService');

const STATUS_FILE = path.join(__dirname, 'statusMessage.json');

async function updateStatusMessage(channel, isOnline) {
  let statusMessageId = null;

  if (fs.existsSync(STATUS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(STATUS_FILE));
      statusMessageId = data?.messageId;
    } catch (err) {
      console.error('Failed to parse status file:', err);
    }
  }

  try {
    if (statusMessageId) {
      const msg = await channel.messages.fetch(statusMessageId);
      if (msg) {
        await editStatusEmbed(msg, isOnline);
        return;
      }
    }
  } catch (err) {
    console.warn('Previous message not found or editable, sending new one...');
  }

  const newMsg = await sendStatusEmbed(channel, isOnline);
  fs.writeFileSync(STATUS_FILE, JSON.stringify({ messageId: newMsg.id }));
}

client.once('ready', async () => {
  console.log(`${client.user.tag} is online ✅`);

  try {
    // Start Channel for Bot Status
    const startChannelId = process.env.CHANNEL_START;
    if (!startChannelId) throw new Error('CHANNEL_START is not defined');
    const startChannel = await client.channels.fetch(startChannelId);
    if (startChannel) {
      await updateStatusMessage(startChannel, true);
    }

    // Report Channel for Transaction Dropdown
    const reportChannelId = process.env.CHANNEL_REPORT;
    if (!reportChannelId) throw new Error('CHANNEL_REPORT is not defined');
    const reportChannel = await client.channels.fetch(reportChannelId);
    if (reportChannel) {
      await sendTransactionDropdown(reportChannel);
    }

    // Manager Channel for Clear Channel Dropdown
    const managerChannelId = process.env.CHANNEL_MANAGER;
    if (!managerChannelId) {
      console.warn('CHANNEL_MANAGER is not defined in .env');
    } else {
      await sendChannelManagerDropdown(client, managerChannelId);
    }

    // Notification Channel
    const notificationChannelId = process.env.CHANNEL_NOTIFICATION;
    if (notificationChannelId) {
      const notificationChannel = await client.channels.fetch(notificationChannelId);
      if (notificationChannel) {
        const notifyEmbed = new EmbedBuilder()
          .setColor('Green')
          .setTitle('🔔 Panakkaran Bot is Now Online!')
          .setDescription('The bot has successfully started and is running smoothly.')
          .setFooter({ text: 'Powered by Muhammed Razi™' })
          .setTimestamp();

        await notificationChannel.send({ embeds: [notifyEmbed] });
      }
    }

  } catch (error) {
    console.error('Error on ready:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await interactionRouter(interaction);
  } catch (err) {
    console.error('Interaction Error:', err);
  }
});

// Graceful Shutdown
async function handleShutdown() {
  try {
    const startChannelId = process.env.CHANNEL_START;
    if (startChannelId) {
      const startChannel = await client.channels.fetch(startChannelId);
      if (startChannel) {
        await updateStatusMessage(startChannel, false);
      }
    }
  } catch (error) {
    console.error('Failed to update offline status:', error);
  } finally {
    process.exit(0);
  }
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
client.on('error', console.error);
process.on('unhandledRejection', console.error);

client.login(process.env.DISCORD_TOKEN);
