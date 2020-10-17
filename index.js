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

// create bot and get the bot token
const web = new WebClient(process.env.BOT_TOKEN);

// post a message when going online
web.chat.postMessage({
    channel: '#test',
    text: 'I am online and working a third time',
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
    // if the message was not sent by the bot and is part of a thread reply
    // this is dumb because it will constantly repete this in a thread 
    // remove this once done testing 
    if (Event.user !== 'U01CC0WFQQ7' && typeof threadValue !== 'undefined') {
        web.chat.postMessage({
            channel: Event.channel,
            thread_ts: Event.thread_ts,
            text: 'we are having a conversation',

        })
    }


});
// logs any erros from the event handler 
slackEvents.on('error', console.error);

// turns on the event handler 
slackEvents.start(port).then(() => {
    console.log(`Server listening on port ${port}`);
});