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
// dotenv loads environmental variables to hide sensitive data 
const dotenv = require('dotenv');

dotenv.config()

const fs = require('fs');
const {
    setUncaughtExceptionCaptureCallback
} = require('process');

// load json file
const questionsText = fs.readFileSync("questions.json")
// parse json file to be readable 
const questions = JSON.parse(questionsText)

// create bot and get the bot token
const web = new WebClient(process.env.BOT_TOKEN);

// post a message when going online
web.chat.postMessage({
    channel: '#testing',
    text: 'I am online and working! on the json branch',
})

// create an adapter to receive events from slack
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const port = process.env.PORT || 15119;


// logs messages received to the console 
slackEvents.on('message', (Event) => {
    console.log(`Received a message event: user ${Event.user} in channel ${Event.channel} says ${Event.text}`);
    //stores the text of the message to a var
    const messageText = Event.text
    // creates a variable that we can check to see if a message is part of a thread
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
        // used to remove punctuation from a users question for comparisons
        const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
        const messageTextClean = removePunctuation(messageText)
        const questionText = messageTextClean


        // removes punctuation 
        function removePunctuation(string) {
            return string.replace(regex, '');
        }
        // turns the users question into an array we can loop though 
        var questionAr = questionText.split(' ');
        console.log(questionAr)

        // create a list of counters to use a variables 
        var counters = [];
        for (i = 0; i < questions.length; i++) {
            counters[i] = questions[i]["counter"]
        }
        console.log(`counters is set to: ${counters}`)
        // turn list into key value pairs to hold data 
        var countersValue = counters.reduce((obj, arrValue) => (obj[arrValue] = 0, obj), {});

        console.log(countersValue)
        //create a list of possible answers to questions 
        var answer = [];
        for (i = 0; i < questions.length; i++) {
            answer[i] = questions[i]["answer"]
        }
        // create key value pair from counters and answers to be able to choose a result based on the counter value 
        let answersMapped = counters.reduce((obj, arrValue) => (obj[arrValue] = '0', obj), {});
        console.log(answersMapped)
        for (i = 0; i < answer.length; i++) {
            answersMapped[counters[i]] = answer[i]
        }

        // loop though the array created from the  users question and looks for matches in the keywords from the json file 
        // increases the counters value to determine the most likely proper response 
        for (i = 0; i < counters.length; i++) {


            questionAr.forEach(element => {
                if (questions[i].keywords.includes(element)) {
                    countersValue[counters[i]]++

                }
            })



            // finds the greatest value in the dictionary 
            greatest = Object.values(countersValue).sort((a, b) => a - b).pop()
            // finds the key that matches the greatest value 
            key = Object.keys(countersValue).find(k => countersValue[k] === greatest)
            console.log(key)
        }
        // sends a message with the text of the largest keyword match value defaults to the first in the list if there 
        // where no matches which is unknown question 
        // TODO look into handling for ties 
        console.log(`the value of key is ${key}`)
        console.log(answersMapped)
        web.chat.postMessage({
            channel: Event.channel,
            thread_ts: Event.ts,
            text: answersMapped[key]
        });



    }

});
// logs any errors from the event handler 
slackEvents.on('error', console.error);

// turns on the event handler 
slackEvents.start(port).then(() => {
    console.log(`Server listening on port ${port}`);
});