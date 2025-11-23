// src/api/chat.ts
import { apiPost } from "./client";
import { MessageHistory } from "../components/chat/types"; // adjust import

export async function getChatResponse(messages: MessageHistory[]) {
  const data = await apiPost("/chat", { messages });
  return data.reply as string;
}
