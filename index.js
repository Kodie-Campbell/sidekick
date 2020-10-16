// require dependencies 
const SlackBot = require('slackbots');
// axios is an HTTP client https://github.com/axios/axios
const axios = require('axios');
// dotenv loads env's to hide sensitive data 
const dotenv = require('dotenv');


// create bot and get the bot token
const bot = new SlackBot({
    token: `${process.env.BOT_TOKEN}`,
    name: 'sidekick'

});

bot.on('start', () => {
    const params = {
        icon_emoji: ':robot_face:'
    }

    bot.postMessageToChannel(
        'test',
        'This is a test to see if i am on and working',
        params
    );
});