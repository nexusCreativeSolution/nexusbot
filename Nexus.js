const Telegraf = require('node-telegram-bot-api');
const { ttdl } = require('btch-downloader');
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express'); 
const app = express();
const port = process.env.PORT || 1004;
const axios = require('axios');

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

// Bot setup
let token = '7486712323:AAGCwVA20w4CJ5sP4sTYXe2_sh7HbsA4xeQ';  // replace this with your bot token
const bot = new Telegraf(token, { polling: true });
const adminChatId = 7422499452; // Your personal chat ID
const userRequests = {}; // Store user requests

// Utility functions
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

// Polling error handler
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

// Handle user details
const userDetails = {}; // To store user details

// Start command handler
bot.onText(/^\/start$/, (msg) => {
  const From = msg.chat.id;

  // Ask for the user's Telegram username
  bot.sendMessage(From, "Welcome to Nexus Creative Solution’s Telegram bot! Please provide your Telegram username for our records:");
  userDetails[From] = { stage: 'waiting_for_username' };
});

// Handle user messages
bot.on('message', async (msg) => {
  const From = msg.chat.id;
  const text = msg.text.trim();

  // Check if we're waiting for the user's username
  if (userDetails[From] && userDetails[From].stage === 'waiting_for_username') {
    userDetails[From].username = text;
    userDetails[From].stage = 'username_collected';

    bot.sendMessage(From, "Thank you! Now, please select a service from the menu below:");
    showServiceMenu(From);
    return;
  }

  // Handle service selection and other user messages
  if (userRequests[From] && !['poster_design', 'business_bot', 'website_creation'].includes(text)) {
    const wordCount = text.split(/\s+/).length; // Count words in the message

    if (wordCount >= 20) {
      userRequests[From].details = text;
      const userRequest = userRequests[From];

      // Send the request to the admin
      await sendRequestToAdmin(From, userRequest);

      // Notify the user
      bot.sendMessage(From, "Thank you for your request! We will get back to you shortly.");

      // Optionally, remove the request after processing
      delete userRequests[From];
    } else {
      bot.sendMessage(From, "Your request is too short. Please provide at least 20 words of details.");
    }
  } else if (text.includes('whatsapp bot')) {
    const response = "You mentioned a WhatsApp bot! Please provide more details about your requirements.";
    bot.sendMessage(From, response);
  }
});

// Function to show service menu
function showServiceMenu(userId) {
  const caption = `
We offer a range of services including poster designs, business bots for both WhatsApp and Telegram, and website creation.

Please select a service from the menu below:`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Poster Design', callback_data: 'poster_design' }],
        [{ text: 'Business Bot', callback_data: 'business_bot' }],
        [{ text: 'Website Creation', callback_data: 'website_creation' }]
      ]
    }
  };

  bot.sendMessage(userId, caption, options);
}

// Handle callback queries
bot.on('callback_query', (query) => {
  const From = query.message.chat.id;
  const data = query.data;

  handleServiceSelection(From, data);
  bot.answerCallbackQuery(query.id); // Acknowledge the callback
});

// Process service selection
function handleServiceSelection(userId, data) {
  let response;
  if (data === 'poster_design') {
    response = "You selected Poster Design! Please provide more details about your requirements.";
    userRequests[userId] = { service: 'Poster Design', details: '' };
  } else if (data === 'business_bot') {
    response = "You selected Business Bot! Please specify whether you need a WhatsApp or Telegram bot and provide more details.";
    userRequests[userId] = { service: 'Business Bot', details: '' };
  } else if (data === 'website_creation') {
    response = "You selected Website Creation! Please provide more details about the type of website you need.";
    userRequests[userId] = { service: 'Website Creation', details: '' };
  }

  bot.sendMessage(userId, response);
}

// Function to send request details to admin with username
async function sendRequestToAdmin(userId, userRequest) {
  try {
    // Retrieve the user's Telegram username from the userDetails object
    const username = userDetails[userId] && userDetails[userId].username ? userDetails[userId].username : 'Unknown';

    const message = `
New Request Received:
User ID: ${userId}
Username: ${username}
Service: ${userRequest.service}
Details: ${userRequest.details}
    `;
    await bot.sendMessage(adminChatId, message);
    console.log('Message sent to admin successfully');
  } catch (error) {
    console.error('Error sending request to admin:', error);
  }
}
