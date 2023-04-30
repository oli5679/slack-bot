export interface Message {
    ts: string;
    channel: string;
    text: string;
    user?: string;
}

export interface Reaction {
    channel: string;
    userId: string;
    reaction: string;
    messageTs: string;
}

export interface SlackThread {
    messages: Array<Message>
}
