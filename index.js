// require dependencies 
const {
    WebClient
} = require('@slack/web-api');
const {
    EventClient
} = require('@slack/events-api');
// axios is an HTTP client https://github.com/axios/axios
const axios = require('axios');
// dotenv loads env's to hide sensitive data 
const dotenv = require('dotenv');

dotenv.config()

// create bot and get the bot token
const web = new WebClient(process.env.BOT_TOKEN);

web.chat.postMessage({
    channel: '#test',
    text: 'I am online and working a third time',
})