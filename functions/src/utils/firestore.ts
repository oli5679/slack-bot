import * as admin from "firebase-admin";

import { Message, Reaction } from "../interfaces/slack";
import { FirebaseCollections } from "../enums/firebase";

admin.initializeApp();

export const db = admin.firestore();

export async function saveMessage(threadId: string, message: Message): Promise<void> {
  const threadRef = db.collection(FirebaseCollections.THREADS).doc(threadId);
  const threadData = { messages: admin.firestore.FieldValue.arrayUnion(message) };
  await threadRef.set(threadData, { merge: true });
}

export async function saveReaction(reaction: Reaction): Promise<void> {
  await db.collection(FirebaseCollections.REACTIONS).add(reaction);
}

export async function getMessages(threadId: string): Promise<Message[]> {
  const threadRef = db.collection(FirebaseCollections.THREADS).doc(threadId);
  const thread = await threadRef.get();
  if (!thread.exists) {
    return [];
  }
  return thread.data()!.messages as Message[];
}
