const TelegramBot = require('node-telegram-bot-api');
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
const BOT_TOKEN = '7465318130:AAFui5FZMfGix7uVOR8j-fodfdyQsb8qCRM'; // Your actual bot token
const ADMIN_CHAT_ID = 7422499452; // Your personal chat ID for receiving requests
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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

// Helper function to show service menu
const showServiceMenu = (chatId) => {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Poster Design', callback_data: 'poster_design' }],
        [{ text: 'Business Bot', callback_data: 'business_bot' }],
        [{ text: 'Website Creation', callback_data: 'website_creation' }],
      ],
    },
  };
  bot.sendMessage(chatId, 'Please select a service:', options);
};

// Handle /start command
bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  if (!userDetails[chatId] || !userDetails[chatId].username) {
    bot.sendMessage(chatId, "Welcome to Nexus Creative Solution! Please provide your Telegram username:");
    userDetails[chatId] = { stage: 'waiting_for_username' };
  } else {
    showServiceMenu(chatId);
  }
});

// Handle service selection via callback query
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
    default:
      response = "Unknown service. Please select a valid option.";
  }
  bot.sendMessage(chatId, response);
  bot.answerCallbackQuery(query.id);
});

// Handle all messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text.toLowerCase().trim();

  // Check if the user is providing a username
  if (userDetails[chatId]?.stage === 'waiting_for_username') {
    userDetails[chatId].username = msg.text;
    userDetails[chatId].stage = 'completed';
    bot.sendMessage(chatId, "Thank you! Now, please select a service from the menu below.");
    showServiceMenu(chatId);
  } else if (userRequests[chatId] && !userRequests[chatId].details) {
    // Check if user is providing details for a selected service
    if (userMessage.split(/\s+/).length >= 20) {
      userRequests[chatId].details = userMessage;
      const username = userDetails[chatId]?.username || 'Unknown User';

      const adminMessage = `
New Request Received:
Username: ${username}
Service: ${userRequests[chatId].service}
Details: ${userRequests[chatId].details}
      `;

      // Send request details to admin
      bot.sendMessage(ADMIN_CHAT_ID, adminMessage);
      bot.sendMessage(chatId, "Thank you! Your request has been sent. We will get back to you soon.");

      // Clear the user's request data
      delete userRequests[chatId];
    } else {
      bot.sendMessage(chatId, "Please provide at least 20 words describing your requirements.");
    }
  } else {
    // General message handling
    let responseMessage = "";

    if (userMessage.includes('hi')) {
      responseMessage = "Hi there! You're now chatting with Nexus Bot. Type /start to get started.";
    } else if (userMessage.includes('contact')) {
      responseMessage = "Here are the contact details for Nexus Creative Solution:\n\n" +
        "• **Business Name:** Nexus Creative Solution\n" +
        "• **Website:** [nexuscreativesolution.com](https://nexuscreativesolution.com)\n" +
        "• **Instagram:** [@nexus_creative](https://instagram.com/nexus_creative)\n" +
        "• **WhatsApp Number:** +1234567890\n\n" +
        "For a callback, please provide your contact number. If there's anything else we can assist you with, feel free to let us know.";
    } else if (userMessage.includes('budget')) {
      responseMessage = "To help us tailor our services to your needs, please provide the following details:\n\n" +
        "1. **Your estimated budget:**\n" +
        "2. **Project requirements or goals:**\n" +
        "3. **Any specific preferences or constraints:**\n\n" +
        "Here are our general pricing tiers for reference:\n" +
        "- **Basic Package:** JMD 10,000 - JMD 20,000\n" +
        "  * Includes basic designs or simple bot functionalities.\n" +
        "- **Standard Package:** JMD 20,000 - JMD 40,000\n" +
        "  * Includes intermediate designs or moderately advanced functionalities.\n" +
        "- **Professional Package:** JMD 40,000 - JMD 80,000\n" +
        "  * Includes high-quality designs or sophisticated bot solutions.\n\n" +
        "Providing your budget and project details will help us offer you the best possible service within your budget. Thank you!";
    } else if (userMessage.includes('about')) {
      responseMessage = "Nexus Creative Solution offers a range of services including Poster Design, Business Bot development, and Website Creation. Type /start to get started! 😊";
    }

    // Send response if set
    if (responseMessage) {
      bot.sendMessage(chatId, responseMessage);
    }
  }
});
