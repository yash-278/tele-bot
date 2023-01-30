require("dotenv").config();
import TelegramBot = require("node-telegram-bot-api");
import google = require("googlethis");
import ud = require("urban-dictionary");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.ID!;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  if (!match) {
    return;
  }

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
// bot.on("message", (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message

//   // Log sender and message
//   console.log(msg.from && msg.from.first_name + " " + msg.from.last_name + " sent: " + msg.text);
//   bot.sendMessage(chatId, "Received your message " + msg.text);
// });

// Matches "/google [whatever]"
bot.onText(/\/g (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  if (!match) {
    return;
  }

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  const options = {
    page: 0,
    safe: false, // Safe Search
    parse_ads: false, // If set to true sponsored results will be parsed
    additional_params: {
      // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
      hl: "en",
    },
  };

  google.search(resp, options).then((response) => {
    const resultsMap = response.results.map((result) => {
      return `[${result.title}](${result.url})`;
    });

    // Send all results to the chat as a single message on new lines and make them clickable

    bot.sendMessage(
      chatId,
      `${msg.from?.first_name} Here are your search results for requested query \n\n` +
        resultsMap.join("\n\n"),
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }
    );
  });
});

// Matches "/ud [whatever]"
bot.onText(/\/ud (.+)/, (msg, match) => {
  const getMessageText = (results: ud.DefinitionObject[]) => {
    return `
    Here are the top 3 results for your query \n\n*Word : ${results[0].word}*\n\n${results
      .slice(0, 3)
      .map((result) => {
        return `[Definition](${result.permalink}) : _${result.definition}_\n*Example* : _${result.example}_\n*Rating* : ${result.thumbs_up} ⬆️  ${result.thumbs_down} ⬇️`;
      })
      .join("\n\n")}`;
  };

  if (!match) {
    bot.sendMessage(msg.chat.id, "Please provide a word to search for");
    return;
  }

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  ud.define(resp)
    .then((results) => {
      console.log(results);
      bot.sendMessage(chatId, getMessageText(results), {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      });
    })
    .catch((error) => {
      bot.sendMessage(chatId, "No results found");
      console.error(`define (promise) - error ${error.message}`);
    });
});
