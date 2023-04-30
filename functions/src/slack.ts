import { App, ExpressReceiver, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "firebase-functions";

import { SlackMessage, SlackReaction, SlackThread } from "./interface";
import { saveMessage, saveReaction } from "./utils/firestore";

import { OpenAIChat } from "./utils/create-chat";


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

        // todo look up all thread
        const thread: SlackThread = {
            messages: [message],
        };

        const responseText = await openai.createChat(thread);
        const response = {
            text: responseText,
            thread_ts: event.thread_ts || event.ts,
        }
        try {
            await say(response);
            logger.log(`Message sent: ${responseText}`)
        } catch (error) {
            console.error("Error sending message:", error, responseText);
        }
    });

    app.event("message", async ({ event }: SlackEventMiddlewareArgs<"message">) => {
        logger.log("Message event:", event);
        if ("text" in event && "user" in event) {
            let threadTs: string;
            if ("thread_ts" in event) {
                threadTs = event.thread_ts as string;
            } else {
                threadTs = event.ts;
            }
            const slackMessage: SlackMessage = {
                ts: event.ts,
                channel: event.channel,
                text: event.text as string,
                user: event.user,
            };
            logger.log("Saving message:", slackMessage);
            await saveMessage(threadTs, slackMessage);
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
                threadTs: event.item.ts,
            };
            logger.log("Saving reaction:", slackReaction);
            await saveReaction(slackReaction);
        }
    });
    return receiver.app;
};
