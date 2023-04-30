import { App, ExpressReceiver, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "firebase-functions";

import { SlackMessage, SlackReaction } from "./interface";
import { saveMessage, saveReaction, getMessages } from "./utils/firestore";
import { OpenAIChat } from "./utils/create-chat";
import { timestamp } from "./utils/timestamp";


export const initializeSlackApp = (token: string, signingSecret: string, openAiKey: string) => {
    const receiver = new ExpressReceiver({ signingSecret })
    const app = new App({
        token,
        receiver
    });
    const botUserPromise = app.client.auth.test();
    const openai = new OpenAIChat(openAiKey, botUserPromise);

    logger.log("Slack app initialized");
    app.event("app_mention", async ({ event, say }: SlackEventMiddlewareArgs<"app_mention">) => {
        logger.log("app_mention event:", event);
        const message: SlackMessage = {
            channel: event.channel,
            text: event.text as string,
            user: event.user,
            ts: event.ts,
        };

        const threadTs = event.thread_ts || event.ts;
        await saveMessage(threadTs, message);

        const messageHistory = await getMessages(threadTs);

        logger.log("Thread:", messageHistory);
        const responseText = await openai.createChat(messageHistory) as string;
        const response = {
            text: responseText,
            thread_ts: event.thread_ts || event.ts,
        }
        try {
            await say(response);
            const ts = timestamp();
            logger.log(`Message sent: ${responseText}`)
            const messageResponse: SlackMessage = {
                channel: event.channel,
                text: responseText,
                user: 'bot',
                ts
            }

            await saveMessage(threadTs, messageResponse);

            logger.log("Response saved to Firestore:", message);
        } catch (error) {
            console.error("Error sending message:", error, responseText);
        }
    });

    app.event("reaction_added", async ({ event }: SlackEventMiddlewareArgs<"reaction_added">) => {
        logger.log("Reaction added to  message:", event);
        const itemUser = event.item_user;
        const botId = (await botUserPromise).user_id;
        if (itemUser === botId && "ts" in event.item) {
            logger.log("Reaction added to bot message:", event)
            const slackReaction: SlackReaction = {
                channel: event.item.channel,
                userId: event.user,
                reaction: event.reaction,
                messageTs: event.item.ts,
            };
            logger.log("Saving reaction:", slackReaction);
            await saveReaction(slackReaction);
        }
    });
    return receiver.app;
};
