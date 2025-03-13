import OpenAI from "openai";

export class MessageHistory {
    role: "system" | "user" | "assistant" = "system";
    content: string = "";
}

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // TODO, Allow the API to be used in the browser, not recommended for production
});

interface ChatGPTProps {
    prompt: string;
    messageHisto: MessageHistory[];
    setMessageHisto: (messageHisto: MessageHistory[]) => void;
    setResponse: (response: string) => void;
}

const handleChatSubmit = async ({
    prompt,
    messageHisto,
    setMessageHisto,
    setResponse,
}: ChatGPTProps) => {
    if (!prompt) {
        console.log("Prompt is empty");
        return;
    }

    // Append the new user message to the message history
    const updatedMessages: {
        role: "system" | "user" | "assistant";
        content: string;
    }[] = [...messageHisto, { role: "user", content: prompt }];
    setMessageHisto(updatedMessages);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: updatedMessages, // Send the entire conversation history
        });

        const assistantResponse = completion.choices[0].message.content || "";

        // Append the assistant's response to the message history
        const updatedMessagesWithResponse: {
            role: "system" | "user" | "assistant";
            content: string;
        }[] = [
            ...updatedMessages,
            { role: "assistant", content: assistantResponse },
        ];
        setMessageHisto(updatedMessagesWithResponse);
        console.log("message history", updatedMessagesWithResponse);

        // Update the displayed response
        setResponse(assistantResponse);
    } catch (error) {
        console.error("Error fetching response:", error);
    }
};

const handleChatSubmitSuggest = async ({
    prompt,
    messageHisto,
    setMessageHisto,
    setResponse,
}: ChatGPTProps) => {
    console.log("Suggesting nothing so far...");
    console.log("Prompt:", prompt);

    // prompt = "What could be "
};

export { handleChatSubmit, handleChatSubmitSuggest };
