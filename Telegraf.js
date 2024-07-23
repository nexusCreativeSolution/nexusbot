const Telegraf = require('node-telegram-bot-api');
const { ttdl } = require('btch-downloader');
const util = require('util');
const chalk = require('chalk');
const figlet = require('figlet');
const express = require('express'); 
const app = express();
const port = process.env.PORT || 1004;

// express 
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
let token = '7465318130:AAFui5FZMfGix7uVOR8j-fodfdyQsb8qCRM'  //replace this part with your bot token
const bot = new Telegraf(token, { polling: true });
let Start = new Date();

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

// set menu
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

// command

const adminChatId = 7422499452; // Your personal chat ID
const userRequests = {}; // Store user requests
const bookings = {}; // Store bookings

// Step 1: Start Command
bot.onText(/^\/start$/, (msg) => {
  const From = msg.chat.id;
  const caption = `
Welcome to Nexus Creative Solution’s Telegram bot!

We offer a range of services including poster designs, business bots, and website creation.

To schedule a consultation, please select a service:`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Poster Design', callback_data: 'consult_poster' }],
        [{ text: 'Business Bot', callback_data: 'consult_bot' }],
        [{ text: 'Website Creation', callback_data: 'consult_website' }]
      ]
    }
  };

  bot.sendMessage(From, caption, options);
});

// Step 2: Handle Service Selection
bot.on('callback_query', (query) => {
  const From = query.message.chat.id;
  const data = query.data;

  let response;
  if (data.startsWith('consult_')) {
    const service = data.replace('consult_', '');
    response = `You selected ${capitalize(service)}! Please choose a date and time for your consultation.`;

    // Save the service and request additional details
    userRequests[From] = { service, details: '' };

    // Example of available time slots (you can customize this)
    const dateOptions = [
      [{ text: 'Tomorrow', callback_data: 'slot_tomorrow' }],
      [{ text: 'Next Week', callback_data: 'slot_next_week' }]
    ];

    bot.sendMessage(From, response, {
      reply_markup: { inline_keyboard: dateOptions }
    });
  }

  bot.answerCallbackQuery(query.id); // Acknowledge the callback
});

// Step 3: Handle Date/Time Slot Selection
bot.on('callback_query', (query) => {
  const From = query.message.chat.id;
  const data = query.data;

  let response;
  if (data === 'slot_tomorrow') {
    response = "You have selected a slot for tomorrow. Please provide your preferred time and any additional details.";
    bookings[From] = { time: 'Tomorrow', details: '' };
  } else if (data === 'slot_next_week') {
    response = "You have selected a slot for next week. Please provide your preferred time and any additional details.";
    bookings[From] = { time: 'Next Week', details: '' };
  }

  bot.sendMessage(From, response);
  bot.answerCallbackQuery(query.id); // Acknowledge the callback
});

// Step 4: Handle Booking Details
bot.on('message', async (msg) => {
  const From = msg.chat.id;
  const text = msg.text.trim();

  if (bookings[From]) {
    bookings[From].details = text;

    // Send booking details to admin
    const booking = bookings[From];
    await sendBookingToAdmin(From, userRequests[From].service, booking);

    // Confirm booking with user
    bot.sendMessage(From, "Thank you for scheduling your consultation! We will contact you soon with further details.");

    // Clean up after booking
    delete bookings[From];
  }
});

// Function to send booking details to admin
async function sendBookingToAdmin(userId, service, booking) {
  try {
    const message = `
New Booking Received:
User ID: ${userId}
Service: ${service}
Date/Time: ${booking.time}
Details: ${booking.details}
    `;
    await bot.sendMessage(adminChatId, message);
    console.log('Booking details sent to admin successfully');
  } catch (error) {
    console.error('Error sending booking details to admin:', error);
  }
}

// Utility function to capitalize the first letter of a string
function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
///end here

bot.on('message', async (msg) => {
  Figlet();
  logs('Success activated', 'green');
  const From = msg.chat.id;
  const body = /^https:\/\/.*tiktok\.com\/.+/;
   if (body.test(msg.text)) {
    const url = msg.text;
    try {        
        const data = await ttdl(url)
        const audio = data.audio[0]
        const { title, title_audio } = data;
        await bot.sendVideo(From, data.video[0], { caption: title });
        await sleep(3000)
        await bot.sendAudio(From, audio, { caption: title_audio });
        await sleep(3000)
        await bot.sendMessage(From, 'Powered by @wtffry');
    } catch (error) {
        bot.sendMessage(From, 'Sorry, an error occurred while downloading the TikTok video.');
        log(`[ ERROR ] ${From}: ${error.message}`, 'red');
    }
}
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
