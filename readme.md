# Slack App

Learning how to deploy a slack app to GCP Firebase. This one lets you chat to open-ai API from within your slack instance, and saves all the messages to collect feedback. 

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
