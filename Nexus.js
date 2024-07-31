const Telegraf = require('node-telegram-bot-api');
const { ttdl } = require('btch-downloader');
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express'); 
const app = express();
const port = process.env.PORT || 8080;
const axios = require('axios');

// Express setup
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const data = {
    status: 'true',
    message: 'Bot Successfully Activated!',
    author: 'NEXUS'
  };
  const result = { response: data };
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
let token = '7465318130:AAFui5FZMfGix7uVOR8j-fodfdyQsb8qCRM';  // Replace with your bot token
const bot = new Telegraf(token, { polling: true });
let Start = new Date();
const adminChatId = 7422499452; // Your personal chat ID
const userRequests = {}; // Store user requests
const userDetails = {}; // Store user details

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

// Set bot commands
bot.setMyCommands([
  { command: '/start', description: 'Start a new conversation' },
  { command: '/runtime', description: 'Check bot runtime' }
]);

// Start command handler
bot.onText(/^\/start$/, (msg) => {
  const From = msg.chat.id;

  // Check if username is already collected
  if (userDetails[From] && userDetails[From].username) {
    // If the username is already collected, show the service menu
    showServiceMenu(From);
  } else {
    // Otherwise, ask for the user's Telegram username
    bot.sendMessage(From, "Welcome to Nexus Creative Solution’s Telegram bot! Please provide your Telegram username for our records:");
    userDetails[From] = { stage: 'waiting_for_username' };
  }
});

// Handle user messages
bot.on('message', async (msg) => {
  const From = msg.chat.id;
  const text = msg.text.trim();

  // Check if we're waiting for the user's username
  if (userDetails[From] && userDetails[From].stage === 'waiting_for_username') {
    userDetails[From].username = text;
    userDetails[From].stage = 'username_collected';

    // Show the service menu after collecting the username
    bot.sendMessage(From, "Thank you! Now, please select a service from the menu below:");
    showServiceMenu(From);
    return;
  }

  // If the user has selected a service and is providing details
  if (userRequests[From] && !['poster_design', 'business_bot', 'website_creation'].includes(text)) {
    const wordCount = text.split(/\s+/).length; // Count words in the message

    if (wordCount >= 20) {
      userRequests[From].details = text;
      const userRequest = userRequests[From];

      // Send the request to the personal chat ID
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

// Handle Callback Queries
bot.on('callback_query', (query) => {
  const From = query.message.chat.id;
  const data = query.data;

  handleServiceSelection(From, data);
  bot.answerCallbackQuery(query.id); // Acknowledge the callback
});

// Show service menu
function showServiceMenu(chatId) {
  const caption = `
Welcome to Nexus Creative Solution’s Telegram bot!

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

  bot.sendMessage(chatId, caption, options);
}

// Process Service Selection
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

// Function to send request details to admin
async function sendRequestToAdmin(userId, userRequest) {
  try {
    const username = userDetails[userId].username || 'Unknown'; // Default to 'Unknown' if username is not available
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

// Feedback Command
bot.onText(/^\/feedback$/, (msg) => {
  const From = msg.chat.id;
  bot.sendMessage(From, 'Please provide your feedback about our services:');
});

bot.onText(/^\/submit_feedback (.+)$/, (msg, match) => {
  const From = msg.chat.id;
  const feedback = match[1];

  bot.sendMessage(adminChatId, `Feedback from user ${From}: ${feedback}`);
  bot.sendMessage(From, 'Thank you for your feedback!');
});

// View Active Requests Command
bot.onText(/^\/requests$/, (msg) => {
  const From = msg.chat.id;

  if (From === adminChatId) {
    let response = 'Active Requests:\n\n';
    const requestKeys = Object.keys(userRequests);

    if (requestKeys.length === 0) {
      response = 'There are no active requests at the moment.';
    } else {
      requestKeys.forEach((userId) => {
        const request = userRequests[userId];
        response += `User ID: ${userId}\nService: ${request.service}\nDetails: ${request.details || 'Pending'}\n\n`;
      });
    }

    bot.sendMessage(From, response);
  } else {
    bot.sendMessage(From, 'You do not have permission to view active requests.');
  }
});
