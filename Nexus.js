// Dependencies and Bot setup
const Telegraf = require('node-telegram-bot-api');
const { ttdl } = require('btch-downloader');
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 8080;

// Express setup
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const data = {
    status: 'true',
    message: 'Bot Successfully Activated!',
    author: 'NEXUS'
  };
  const result = {
    response: data
  };
  res.send(JSON.stringify(result, null, 2));
});

function listenOnPort(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use. Trying another port...`);
      listenOnPort(port + 1);
    } else {
      console.error(err);
    }
  });
}

listenOnPort(port);

// Bot config token
let token = '7465318130:AAFui5FZMfGix7uVOR8j-fodfdyQsb8qCRM';  // Replace with your bot token
const bot = new Telegraf(token, { polling: true });
const adminChatId = 7422499452; // Your personal chat ID
const userRequests = {}; // Store user requests

const logs = (message, color) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${timestamp}] => ${message}`));
};

const Figlet = () => {
  figlet('tiktokdl', { font: 'Block', horizontalLayout: 'default' }, function (err, data) {
    if (err) {
      console.log('Error:', err);
      return;
    }
    console.log(chalk.yellow.bold(data));
    console.log(chalk.yellow(`NEXUS BOT`));
  });
};

bot.on('polling_error', (error) => {
  logs(`Polling error: ${error.message}`, 'blue');
});

// Set menu commands
bot.setMyCommands([
  {
    command: '/start',
    description: 'Start a new conversation'
  },
  {
    command: '/runtime',
    description: 'Check bot runtime'
  }
]);

// Start Command
bot.onText(/^\/start$/, (msg) => {
  const From = msg.chat.id;
  userRequests[From] = { stage: 'ask_username' };
  bot.sendMessage(From, "Welcome! Please enter your telegram username:");
});

// Handle messages
bot.on('message', async (msg) => {
  const From = msg.chat.id;
  const text = msg.text.trim();

  if (!userRequests[From]) return;

  const userStage = userRequests[From].stage;

  if (userStage === 'ask_username') {
    userRequests[From].username = text;
    userRequests[From].stage = 'select_service';
    bot.sendMessage(From, "Thank you! Please select a service from the menu below:", {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Poster Design', callback_data: 'poster_design' }],
          [{ text: 'Business Bot', callback_data: 'business_bot' }],
          [{ text: 'Website Creation', callback_data: 'website_creation' }]
        ]
      }
    });
  } else if (userStage === 'collect_details') {
    userRequests[From].details = text;

    if (text.split(/\s+/).length >= 20) {
      await sendRequestToAdmin(From, userRequests[From]);
      bot.sendMessage(From, "Thank you for your request! We will get back to you shortly.");
      delete userRequests[From];
    } else {
      bot.sendMessage(From, "Your request is too short. Please provide at least 20 words of details.");
    }
  }
});

// Handle Callback Queries
bot.on('callback_query', (query) => {
  const From = query.message.chat.id;
  const data = query.data;

  handleServiceSelection(From, data);
  bot.answerCallbackQuery(query.id); // Acknowledge the callback
});

// Process Service Selection
function handleServiceSelection(userId, data) {
  if (data === 'poster_design') {
    userRequests[userId] = { ...userRequests[userId], service: 'Poster Design', stage: 'collect_details' };
    bot.sendMessage(userId, "You selected Poster Design! Please provide more details about your requirements.");
  } else if (data === 'business_bot') {
    userRequests[userId] = { ...userRequests[userId], service: 'Business Bot', stage: 'collect_details' };
    bot.sendMessage(userId, "You selected Business Bot! Please specify whether you need a WhatsApp or Telegram bot and provide more details.");
  } else if (data === 'website_creation') {
    userRequests[userId] = { ...userRequests[userId], service: 'Website Creation', stage: 'collect_details' };
    bot.sendMessage(userId, "You selected Website Creation! Please provide more details about the type of website you need.");
  }
}

// Function to send request details to admin
async function sendRequestToAdmin(userId, userRequest) {
  try {
    const message = `
New Request Received:
User ID: ${userId}
Username: ${userRequest.username}
Service: ${userRequest.service}
Details: ${userRequest.details}
    `;
    await bot.sendMessage(adminChatId, message);
    console.log('Message sent to admin successfully');
  } catch (error) {
    console.error('Error sending request to admin:', error);
  }
}

/// Remaining code for other bot features...
