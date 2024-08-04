const TelegramBot = require('node-telegram-bot-api');
  const express = require('express');
  const chalk = require('chalk');
  const figlet = require('figlet');
  const mongoose = require('mongoose');

  // MongoDB connection
  mongoose.connect('mongodb+srv://casinobot:123johniphone@cluster0.nfztvsi.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
  });

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
  
  const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const userRequests = {};  // Store ongoing requests
const userDetails = {};   // Store user details
const adminDetails = {};  // Store admin details
const PERMANENT_ADMIN_ID = 7422499452;
const ADMIN_CHAT_ID = PERMANENT_ADMIN_ID;  // Admin chat ID for notifications

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

// Start command handler
bot.onText(/^\/start$/, (msg) => {
  const chatId = msg.chat.id;
  showServiceMenu(chatId); // Directly show the service menu
});

function showServiceMenu(chatId) {
  // Define the menu text
  const menuText = `
══════════════════════════════
🌟 𝑩𝒐𝒕 𝑴𝒆𝒏𝒖 🌟
══════════════════════════════
  𝑾𝑬𝑩𝑺𝑰𝑻𝑬 𝑪𝑹𝑬𝑨𝑻𝑰𝑶𝑵
  ➤ Custom websites to boost your online presence.
─────────────────────────
  𝑭𝑳𝒀𝑬𝑹 𝑫𝑬𝑺𝑰𝑮𝑵
  ➤ Stunning flyers for your marketing needs.
─────────────────────────
  𝑻𝑬𝑳𝑬𝑮𝑹𝑨𝑴 𝑩𝒐𝒕
  ➤ Automate and enhance your Telegram interactions.
─────────────────────────
  𝑾𝑯𝑨𝑻𝑺𝑨𝑷𝑷 𝑩𝒐𝒕
  ➤ Streamline your WhatsApp communication.
══════════════════════════════
  🌐 𝑵𝑬𝒳𝑼𝑺 𝑪𝑹𝑬𝑨𝑇𝑰𝑽𝑬 🌐
══════════════════════════════
🌟 _please select 1, 2, or 3_
  `;

  // Send the image with the menu text as a caption
  bot.sendPhoto(chatId, 'https://telegra.ph/file/8365f455d4685e659391a.jpg', {
    caption: menuText,
    parse_mode: 'Markdown'
  });
}
// Handler for /menu command
bot.onText(/\/menu/, async (msg) => {
  const chatId = msg.chat.id;
  showServiceMenu(chatId);
});

// Handler for /help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
Here are my commands:
- /menu: Get started with the bot.
- /help: Show this help message.
- /live: Request a live chat.
- /endchat: End the current chat session.
- /pricing: Show the pricing information.
- /faq: Show frequently asked questions.
- /contact: Contact the bot admin.
- /feedback: provide feedback to the bot admin (type /feedback with the message you want to send).
`);
});

// Handler for /live command
bot.onText(/\/live/, async (msg) => {
  const chatId = msg.chat.id;
  handleLiveCommand(chatId);
});

// Handler for /pricing command
bot.onText(/\/pricing/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
*🌟 Our Pricing 🌟*

*1. Website Creation*
   - **Basic Package**: JMD 10,000
     - Simple design, up to 5 pages
   - **Standard Package**: JMD 20,000
     - Advanced design, up to 10 pages, includes SEO optimization
   - **Premium Package**: JMD 30,000
     - Custom design, unlimited pages, includes SEO optimization and maintenance for 1 month

*2. Flyer Design*
   - **Single-Sided Flyer**: JMD 2,000
     - Professional design, digital file
   - **Double-Sided Flyer**: JMD 3,500
     - Professional design, digital file, print-ready

*3. Telegram/WhatsApp Bots*
   - **Basic Bot**: JMD 7,500
     - Simple automation, up to 5 commands
   - **Advanced Bot**: JMD 12,500
     - Advanced features, up to 15 commands, integration with third-party services
   - **Custom Bot**: JMD 20,000
     - Fully customized features, unlimited commands, ongoing support

*4. Additional Services*
   - **SEO Optimization**: JMD 5,000
   - **Content Creation**: JMD 3,000 per hour
   - **Website Maintenance**: JMD 2,500 per month

For custom quotes or more details on any of our services, please contact us directly!
  `, { parse_mode: 'Markdown' });
});

// Handler for /faq command
bot.onText(/\/faq/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
══════════════════════════════
🌟 **Frequently Asked Questions (FAQ)** 🌟
══════════════════════════════

**Q1: What services do you offer?**
   - We offer Website Creation, Flyer Design, and Telegram/WhatsApp Bots.

**Q2: How long does it take to complete a website?**
   - The time frame depends on the package selected and the complexity of the website. Typically, it ranges from 1 to 4 weeks.

**Q3: Can I make changes to the flyer design after it's completed?**
   - Yes, you can request changes. However, additional charges may apply depending on the extent of the revisions.

**Q4: What is included in the SEO optimization service?**
   - Our SEO optimization includes keyword research, on-page SEO, and recommendations to improve your search engine rankings.

**Q5: How can I contact you for support?**
   - You can contact us via Instagram, Telegram, WhatsApp, or through our website.

For more details or specific queries, feel free to reach out to us directly!

══════════════════════════════
  `, { parse_mode: 'Markdown' });
});


// Handler for /contact command
bot.onText(/\/contact/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
══════════════════════════════
🌟 **Contact Us** 🌟
══════════════════════════════

📱 **Instagram**:
Follow us for the latest updates and news!
[Instagram](https://instagram.com/nexus_creative_solution)

💬 **Telegram**:
Join our Telegram group for real-time discussions!
[Telegram](https://t.me/TalkWizardBot)

🌐 **Website**:
Visit our website to learn more about our services and offers!
[Website](tinyurl.com/24ckqsmk)

📞 **WhatsApp**:
Contact us directly on WhatsApp for inquiries and support!
[WhatsApp](https://whatsapp.com/channel/0029VacWsSl3LdQOmWZrBj0l)

══════════════════════════════
  `, { parse_mode: 'Markdown' });
});


  bot.onText(/\/getuser (\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1];

    try {
      // Get user details using the Telegram API
      const user = await bot.getChat(userId);

      // Extract username or full name
      const username = user.username ? `@${user.username}` : 'No username';
      const fullName = `${user.first_name} ${user.last_name || ''}`.trim();

      // Send response to the user
      bot.sendMessage(chatId, `
  ══════════════════════════════
  🌟 User Information 🌟
  ══════════════════════════════

  User ID: ${userId}
  Full Name: ${fullName}
  Username: ${username}
  ══════════════════════════════
      `);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "Sorry, I couldn’t retrieve user information. Please check the user ID and try again.");
    }
  });;

const Feedback = require('./feedbackModel'); // Adjust path as necessary

// Handle /feedback command
bot.onText(/^\/feedback (.+)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const feedbackText = match[1];

  try {
    // Save feedback to the database
    const feedback = new Feedback({
      userId: chatId,
      feedback: feedbackText
    });

    await feedback.save();
    bot.sendMessage(chatId, "Thank you for your feedback! We appreciate your input.");
  } catch (error) {
    console.error('Error saving feedback:', error);
    bot.sendMessage(chatId, "Sorry, there was an error processing your feedback. Please try again later.");
  }
});
// Handle /viewfeedback command (Admin Only)
bot.onText(/^\/viewfeedback$/, async (msg) => {
  const chatId = msg.chat.id;

  if (chatId !== PERMANENT_ADMIN_ID) {
    return bot.sendMessage(chatId, "You are not authorized to view feedback.");
  }

  try {
    const feedbacks = await Feedback.find({}).sort({ timestamp: -1 });

    if (feedbacks.length === 0) {
      return bot.sendMessage(chatId, "No feedback available.");
    }

    const feedbackMessages = feedbacks.map(fb => `
      User ID: ${fb.userId}
      Feedback: ${fb.feedback}
      Date: ${fb.timestamp.toLocaleString()}
    `).join('\n\n');

    bot.sendMessage(chatId, `Recent feedbacks:\n\n${feedbackMessages}`);
  } catch (error) {
    console.error('Error retrieving feedbacks:', error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving feedbacks. Please try again later.");
  }
});

// Handler for /status command
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Please use /status online or /status offline to set your status.");
});

// Handler for unknown commands
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim().toLowerCase();

  // Ignore commands handled by bot.onText
  if (text.startsWith('/')) return;

  if (userDetails[chatId] && userDetails[chatId].stage === 'waiting_for_details') {
    // Save user details and notify admin
    userDetails[chatId].details = text;
    sendDetailsToAdmin(chatId, userDetails[chatId]);
    bot.sendMessage(chatId, "Thank you! Your details have been sent to our team. We'll get back to you soon.");
    delete userDetails[chatId]; // Clear user details after sending
  } else if (text === '1' || text === '2' || text === '3') {
    // Set the stage for details collection
    userDetails[chatId] = { stage: 'waiting_for_details', service: text };
    bot.sendMessage(chatId, "Please provide more details about your requirements.");
  } else {
    // Handle general messages
    bot.sendMessage(chatId, "No such command. Type /help to see my commands.");
  }
});

// Function to send details to admin
function sendDetailsToAdmin(chatId, userInfo) {
  const serviceType = {
    '1': 'Website Creation',
    '2': 'Flyer Design',
    '3': 'Telegram Bot',
  };

  const message = `
New service request:

Service: ${serviceType[userInfo.service]}
User ID: ${chatId}
Details: ${userInfo.details}
  `;

  bot.sendMessage(ADMIN_CHAT_ID, message);
}




// Handle /register command for admin registration
bot.onText(/^\/register (.+)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1];

  try {
    // Check if the admin is already registered
    const existingAdmin = await Admin.findOne({ adminId: chatId });

    if (existingAdmin) {
      return bot.sendMessage(chatId, "You are already registered as an admin.");
    }

    // Prompt for Telegram username
    bot.sendMessage(chatId, "Please provide your Telegram username (e.g., @username):");

    // Store the state to capture the next message
    adminDetails[chatId] = { stage: 'waiting_for_username_registration', name: name };

  } catch (err) {
    console.error('Error during admin registration:', err);
    bot.sendMessage(chatId, "There was an error during registration. Please try again later.");
  }
});

// Handle the response with the Telegram username
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim().toLowerCase();

  if (adminDetails[chatId] && adminDetails[chatId].stage === 'waiting_for_username_registration') {
    const username = text.startsWith('@') ? text : `@${text}`;
    const name = adminDetails[chatId].name;

    try {
      // Register new admin with the provided username
      const newAdmin = new Admin({ adminId: chatId, name: name, status: 'offline', telegramUsername: username });
      await newAdmin.save();

      bot.sendMessage(chatId, "You have been registered as an admin. Please set your status using /status online or /status offline.");

      // Clear the admin's state
      delete adminDetails[chatId];
    } catch (err) {
      console.error('Error saving new admin:', err);
      bot.sendMessage(chatId, "There was an error during registration. Please try again later.");
    }
  }
});

// Handle /status command
bot.onText(/^\/status (online|offline)$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const status = match[1]; // 'online' or 'offline'

  try {
    // Find and update the admin's status
    const admin = await Admin.findOneAndUpdate(
      { adminId: chatId },
      { status: status },
      { new: true }
    );

    if (admin) {
      bot.sendMessage(chatId, `Your status has been updated to ${status}.`);
    } else {
      bot.sendMessage(chatId, "You are not registered as an admin. Please register using /register <name>.");
    }
  } catch (err) {
    console.error('Error updating admin status:', err);
    bot.sendMessage(chatId, "There was an error updating your status. Please try again later.");
  }
});

// Handle /live command
async function handleLiveCommand(chatId) {
  try {
    // Check if there are any admins online
    const onlineAdmins = await Admin.find({ status: 'online' });

    if (onlineAdmins.length > 0) {
      // Use the first online admin for simplicity
      const admin = onlineAdmins[0];
      const username = admin.telegramUsername;

      bot.sendMessage(chatId, `You are now connected to an admin:\n\n**Admin Name:** ${admin.name}\n**Admin Contact:** [Contact Admin](https://t.me/${username})\n\nYou can now send messages directly to the admin. If you want to stop the chat, type /endchat.`);
    } else {
      bot.sendMessage(chatId, "All admins are currently offline. Please try again later.");
    }
  } catch (err) {
    console.error('Error handling /live command:', err);
    bot.sendMessage(chatId, "There was an error handling your request. Please try again later.");
  }
}
