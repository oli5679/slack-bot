import * as admin from "firebase-admin";

import { SlackMessage, SlackReaction } from "../interface";
import { FirebaseCollections } from "../enums";

admin.initializeApp();

export const db = admin.firestore();

export async function saveMessage(threadId: string, message: SlackMessage): Promise<void> {
  const threadRef = db.collection(FirebaseCollections.THREADS).doc(threadId);
  const threadData = { messages: admin.firestore.FieldValue.arrayUnion(message) };
  await threadRef.set(threadData, { merge: true });
}

export async function saveReaction(reaction: SlackReaction): Promise<void> {
  await db.collection(FirebaseCollections.REACTIONS).add(reaction);
}

export async function getMessages(threadId: string): Promise<SlackMessage[]> {
  const threadRef = db.collection(FirebaseCollections.THREADS).doc(threadId);
  const thread = await threadRef.get();
  if (!thread.exists) {
    return [];
  }
  return thread.data()!.messages as SlackMessage[];
}
