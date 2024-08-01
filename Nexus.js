const Telegraf = require('node-telegram-bot-api');
const express = require('express');
const chalk = require('chalk');
const figlet = require('figlet');

// Express app setup
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    status: 'true',
    message: 'Bot Successfully Activated!',
    author: 'NEXUS'
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Bot setup
const BOT_TOKEN = '7465318130:AAFui5FZMfGix7uVOR8j-fodfdyQsb8qCRM';// Replace with your actual bot token
const ADMIN_CHAT_ID = 7422499452;    // Your personal chat ID for receiving requests
const bot = new Telegraf(BOT_TOKEN, { polling: true });

const userRequests = {};  // Store ongoing requests
const userDetails = {};   // Store user details

// Function to log messages
const logMessage = (message, color = 'green') => {
  console.log(chalk[color](`[${new Date().toLocaleTimeString()}] ${message}`));
};

// Display bot title with figlet
figlet('NEXUS BOT', (err, data) => {
  if (err) {
    console.log('Error creating title with figlet:', err);
    return;
  }
  console.log(chalk.yellow(data));
  logMessage('Bot successfully started', 'yellow');
});

// Handle start command
bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  if (!userDetails[chatId] || !userDetails[chatId].username) {
    bot.sendMessage(chatId, "Welcome to Nexus Creative Solution! Please provide your Telegram username:");
    userDetails[chatId] = { stage: 'waiting_for_username' };
  } else {
    showServiceMenu(chatId);
  }
});

// Handle username submission
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (userDetails[chatId]?.stage === 'waiting_for_username') {
    userDetails[chatId].username = msg.text;
    userDetails[chatId].stage = 'completed';
    bot.sendMessage(chatId, "Thank you! Now, please select a service from the menu below.");
    showServiceMenu(chatId);
  }
});

// Show service menu to user
const showServiceMenu = (chatId) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Poster Design', callback_data: 'poster_design' }],
        [{ text: 'Business Bot', callback_data: 'business_bot' }],
        [{ text: 'Website Creation', callback_data: 'website_creation' }]
      ]
    }
  };

  bot.sendMessage(chatId, "Please select a service from the menu below:", options);
};

// Handle service selection
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const service = query.data;
  userRequests[chatId] = { service, details: '' };
  
  let response = '';
  switch (service) {
    case 'poster_design':
      response = "You selected Poster Design! Please provide details about your design requirements.";
      break;
    case 'business_bot':
      response = "You selected Business Bot! Please specify if you need a WhatsApp or Telegram bot and describe your requirements.";
      break;
    case 'website_creation':
      response = "You selected Website Creation! Please provide details about the type of website you need.";
      break;
  }
  bot.sendMessage(chatId, response);
  bot.answerCallbackQuery(query.id);
});

// Handle detailed service description
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const request = userRequests[chatId];

  if (request && !request.details) {
    const description = msg.text.trim();
    if (description.split(/\s+/).length >= 20) {
      request.details = description;
      const username = userDetails[chatId]?.username || 'Unknown User';

      const adminMessage = `
New Request Received:
Username: ${username}
Service: ${request.service}
Details: ${request.details}
      `;

      // Send request details to admin
      await bot.sendMessage(ADMIN_CHAT_ID, adminMessage);
      bot.sendMessage(chatId, "Thank you! Your request has been sent. We will get back to you soon.");

      // Clear the user's request data
      delete userRequests[chatId];
    } else {
      bot.sendMessage(chatId, "Please provide at least 20 words describing your requirements.");
    }
  }
});

// Error handling
bot.on('polling_error', (error) => {
  logMessage(`Polling error: ${error.message}`, 'red');
});

bot.on('error', (error) => {
  logMessage(`Bot error: ${error.message}`, 'red');
});

// Feedback handling
bot.onText(/^\/feedback$/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Please provide your feedback:");
});

bot.onText(/^\/submit_feedback (.+)$/, (msg, match) => {
  const chatId = msg.chat.id;
  const feedback = match[1];
  bot.sendMessage(ADMIN_CHAT_ID, `Feedback from ${chatId}: ${feedback}`);
  bot.sendMessage(chatId, "Thank you for your feedback!");
});

// View active requests (for admin)
bot.onText(/^\/requests$/, (msg) => {
  const chatId = msg.chat.id;
  if (chatId === ADMIN_CHAT_ID) {
    const activeRequests = Object.entries(userRequests)
      .map(([id, request]) => `User ID: ${id}, Service: ${request.service}, Details: ${request.details || 'Pending'}`)
      .join('\n\n');
    bot.sendMessage(chatId, activeRequests || "No active requests at the moment.");
  } else {
    bot.sendMessage(chatId, "You do not have permission to view active requests.");
  }
});
