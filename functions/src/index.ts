import * as functions from "firebase-functions";

import { initializeSlackApp } from "./slack";

const expressApp = initializeSlackApp(
    functions.config().slack.token,
    functions.config().slack.signing_secret,
    functions.config().slack.openai_key
);

export const slack = functions.region("europe-west1").https.onRequest(expressApp);

// https://395b-2a00-23c7-991d-3b01-f9-e60-d9e0-cdc0.ngrok-free.app/test-project-5679/europe-west1/slack/slack/events

