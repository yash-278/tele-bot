"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
var TelegramBot = require("node-telegram-bot-api");
var google = require("googlethis");
var ud = require("urban-dictionary");
// replace the value below with the Telegram token you receive from @BotFather
var token = process.env.ID;
// Create a bot that uses 'polling' to fetch new updates
var bot = new TelegramBot(token, { polling: true });
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, function (msg, match) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    if (!match) {
        return;
    }
    var chatId = msg.chat.id;
    var resp = match[1]; // the captured "whatever"
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
bot.onText(/\/g (.+)/, function (msg, match) {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
    if (!match) {
        return;
    }
    var chatId = msg.chat.id;
    var resp = match[1]; // the captured "whatever"
    // send back the matched "whatever" to the chat
    var options = {
        page: 0,
        safe: false,
        parse_ads: false,
        additional_params: {
            // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
            hl: "en",
        },
    };
    google.search(resp, options).then(function (response) {
        var _a;
        var resultsMap = response.results.map(function (result) {
            return "[".concat(result.title, "](").concat(result.url, ")");
        });
        // Send all results to the chat as a single message on new lines and make them clickable
        bot.sendMessage(chatId, "".concat((_a = msg.from) === null || _a === void 0 ? void 0 : _a.first_name, " Here are your search results for requested query \n\n") +
            resultsMap.join("\n\n"), {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
        });
    });
});
// Matches "/ud [whatever]"
bot.onText(/\/ud (.+)/, function (msg, match) {
    var getMessageText = function (results) {
        return "\n    Here are the top 3 results for your query \n\n*Word : ".concat(results[0].word, "*\n\n").concat(results
            .slice(0, 3)
            .map(function (result) {
            return "[Definition](".concat(result.permalink, ") : _").concat(result.definition, "_\n*Example* : _").concat(result.example, "_\n*Rating* : ").concat(result.thumbs_up, " \u2B06\uFE0F  ").concat(result.thumbs_down, " \u2B07\uFE0F");
        })
            .join("\n\n"));
    };
    if (!match) {
        bot.sendMessage(msg.chat.id, "Please provide a word to search for");
        return;
    }
    var chatId = msg.chat.id;
    var resp = match[1]; // the captured "whatever"
    ud.define(resp)
        .then(function (results) {
        console.log(results);
        bot.sendMessage(chatId, getMessageText(results), {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
        });
    })
        .catch(function (error) {
        bot.sendMessage(chatId, "No results found");
        console.error("define (promise) - error ".concat(error.message));
    });
});
