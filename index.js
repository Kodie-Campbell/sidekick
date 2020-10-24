// require dependencies 
const {
    WebClient
} = require('@slack/web-api');
const {
    EventClient,
    createEventAdapter
} = require('@slack/events-api');


// axios is an HTTP client https://github.com/axios/axios
const axios = require('axios');
// dotenv loads env's to hide sensitive data 
const dotenv = require('dotenv');

dotenv.config()

const fs = require('fs');
const {
    setUncaughtExceptionCaptureCallback
} = require('process');

// create bot and get the bot token
const web = new WebClient(process.env.BOT_TOKEN);

// post a message when going online
web.chat.postMessage({
    channel: '#test',
    text: 'I am online and working!',
})

// create an adapter to recive events from slack
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 15119;


// logs messages recived to the console 
slackEvents.on('message', (Event) => {
    console.log(`Received a message event: user ${Event.user} in channek ${Event.channel} says ${Event.text}`);
    //stores the text of the message to a var
    const messageText = Event.text
    // creates a varibile that we can check to see if a message is part of a thread
    let threadValue = 0
    // if the message is not a part of a thread this will become undefined
    threadValue = Event.thread_ts
    console.log(typeof threadValue)
    // print the entire message payload to the  console 
    console.log(Event)
    // if the message text includes the bot name reply in a thread 
    if (messageText.includes('<@U01CC0WFQQ7>')) {
        web.chat.postMessage({
            channel: Event.channel,
            thread_ts: Event.ts,
            text: 'thanks for talking to me',
        })
    }

    // check if message is a question and saves text to a var
    if (messageText.includes('?')) {
        const questionText = messageText
        // used to remove punctuation from a users question for comparisions 
        const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        // turns the users question into an array we can loop though 
        var questionAr = questionText.split(' ');
        // hold a counter to know how to respond after checking for keywords 
        var colorQ = 0
        var weatherQ = 0
        // loads our keyword files 
        var colorFile = fs.readFileSync('color.txt', 'utf8');
        var weatherFile = fs.readFileSync('weather.txt', 'utf8');
        // turns out keyword files into an array 
        var colorAr = colorFile.replace(regex, '').split(', ');
        var weatherAr = weatherFile.split(', ');
        // checks user message against keyword arrays and increments the corrosponding counter 
        questionAr.forEach(element => {
            if (colorAr.includes(element)) {
                colorQ++
            }
        });
        questionAr.forEach(element => {
            if (weatherAr.includes(element)) {
                weatherQ++
            }
        })
        // checks what counter is higher and responds with a related message this is not a great 
        // way of doing it because with lots of questions it will be a lot of if statements 
        if (colorQ > weatherQ) {
            web.chat.postMessage({
                channel: Event.channel,
                thread_ts: Event.ts,
                text: 'My favorite color is blue!'
            });
        } else if (weatherQ > colorQ) {
            web.chat.postMessage({
                channel: Event.channel,
                thread_ts: Event.ts,
                text: 'It is always a great day'
            });
            // if it does not match a knonw question respond to the user that it does not understand
        } else {
            web.chat.postMessage({
                channel: Event.channel,
                thread_ts: Event.ts,
                text: 'I am not sure what you are asking'
            });
        }


    }

});
// logs any erros from the event handler 
slackEvents.on('error', console.error);

// turns on the event handler 
slackEvents.start(port).then(() => {
    console.log(`Server listening on port ${port}`);
});