# Firebase - Slack App

Learning how to deploy a Slack app to GCP Firebase. This one lets you chat using Open-AI API from within your Slack instance, and saves all the messages to collect feedback for improvements, and to let the bot keep track of historic context. 

It relies on using bolts `ExpressReceiver`, to work in functions, and specifying secrets, including keys, using `functions.config()`. 

[WIP] - want to add more testing, and add more prompts and historic to the bot-chat.  

## Setup

1. Install ngrok

```
brew install ngrok
```

Also need to install npm, node if first javascript project

2. Create Slack app with relevant scopes

[todo document exact scopes/investigate scripting app creation]

3. Install javascript dependencies

```npm install```

4. Create Firebase project and login - also need to install https://firebase.google.com/docs/emulator-suite

5. Add secrets

```
firebase functions:config:set slack.openai_key=[key] slack.signing_secret=[secret] slack.token = [token]
```

## Running locally 

1. Run ngrok on Firebase functions port and start FireBase emulator.

```
ngrok http 5001
cd functions
npm run serve
```

2. change app configuration

Navigate to https://api.slack.com/apps/ and under event-subscriptions, change the events-url to [ngrok-url]/[firebase-project]/europe-west1/slack/slack/events
