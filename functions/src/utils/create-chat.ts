import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { logger } from "firebase-functions";
import { AuthTestResponse } from "@slack/web-api";

import { SlackThread } from "../interface";

export class OpenAIChat {
    private apiKey: string;
    private botUserPromise: Promise<AuthTestResponse>;
    private openai: OpenAIApi;

    constructor(apiKey: string, botUserPromise: Promise<AuthTestResponse>) {
        this.apiKey = apiKey;
        this.botUserPromise = botUserPromise;
        const configuration = new Configuration({ apiKey: this.apiKey });
        this.openai = new OpenAIApi(configuration);
    }

    public async createChat(slackThread: SlackThread) {
        const botUserId = (await this.botUserPromise).user_id as string;
        const messages: ChatCompletionRequestMessage[] = slackThread.messages!.map((message) => {
            return {
                role: message.user === botUserId ? "assistant" : "user",
                content: message.text || "",
            };
        });
        logger.log(messages)

        logger.log(`Creating chat completion for thread ${slackThread}`);

        const completion = await this.openai.createCompletion({
            model: "text-davinci-003",
            prompt: messages[messages.length - 1].content,
            max_tokens: 64,
        });

        const { text } = completion.data.choices[0]

        logger.log(`Chat completion generated for thread ${slackThread}. Response: ${text}`);

        return text;
    }
}
