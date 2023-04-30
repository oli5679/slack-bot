export interface SlackMessage {
    ts: string;
    channel: string;
    text: string;
    user?: string;
}

export interface SlackReaction {
    channel: string;
    userId: string;
    reaction: string;
    messageTs: string;
}

export interface SlackThread {
    messages: Array<SlackMessage>
}
