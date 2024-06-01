require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const mongoose = require("mongoose");

const token = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;

mongoose.connect("mongodb://localhost:27017/weatherBot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model("User", { chatId: String });

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome! Use /subscribe to get weather updates."
  );
});

bot.onText(/\/subscribe/, async (msg) => {
  const chatId = msg.chat.id;
  let user = await User.findOne({ chatId });
  if (!user) {
    user = new User({ chatId });
    await user.save();
    bot.sendMessage(chatId, "You have subscribed to weather updates!");
  } else {
    bot.sendMessage(chatId, "You are already subscribed.");
  }
});

bot.onText(/\/unsubscribe/, async (msg) => {
  const chatId = msg.chat.id;
  await User.findOneAndDelete({ chatId });
  bot.sendMessage(chatId, "You have unsubscribed from weather updates.");
});

async function getWeather() {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=KANPUR&appid=${weatherApiKey}`
    );
    return `Weather in YOUR_CITY: ${response.data.weather[0].description}, Temperature: ${response.data.main.temp}`;
  } catch (error) {
    console.error(error);
  }
}

async function sendWeatherUpdates() {
  const users = await User.find();
  const weather = await getWeather();
  users.forEach((user) => {
    bot.sendMessage(user.chatId, weather);
  });
}

setInterval(sendWeatherUpdates, 360000);
