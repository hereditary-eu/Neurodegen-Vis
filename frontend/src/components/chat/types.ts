export interface MessageHistory {
  role: "system" | "user" | "assistant";
  content: string;
}
