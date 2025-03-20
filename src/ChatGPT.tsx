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

let MODEL = "gpt-4o-mini";
// MODEL = "gpt-3.5-turbo";

interface ChatGPTProps {
    prompt: string;
    messageHisto: MessageHistory[];
    setMessageHisto: (messageHisto: MessageHistory[]) => void;
    setResponse: (response: string) => void;
    handleGPTFeatureSuggestions: (featureList: string[]) => void;
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
    const updatedMessages: MessageHistory[] = [
        ...messageHisto,
        { role: "user", content: prompt },
    ];

    // usless, only updated after the function call
    // setMessageHisto(updatedMessages);

    setResponse("Generating response...");

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: updatedMessages, // Send the entire conversation history
        });

        const assistantResponse = completion.choices[0].message.content || "";

        // Append the assistant's response to the message history
        const updatedMessagesWithResponse: MessageHistory[] = [
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
    handleGPTFeatureSuggestions,
}: ChatGPTProps) => {
    setResponse("Generating suggestions...");

    let featureList: string[] = ["", ""];
    let prompt_2 =
        "What could be two to interesting features to analyze in a scatterplot, if there, consider previous prompts?. Your answer should be the two features, seperated through a coma. No additional text.";
    // Append the new user message to the message history
    const updatedMessages: MessageHistory[] = [
        ...messageHisto,
        { role: "user", content: prompt_2 },
    ];
    setMessageHisto(updatedMessages);

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: updatedMessages, // Send the entire conversation history
        });

        const assistantResponse = completion.choices[0].message.content || "";

        // Append the assistant's response to the message history
        const updatedMessagesWithResponse: MessageHistory[] = [
            ...updatedMessages,
            { role: "assistant", content: assistantResponse },
        ];

        featureList = assistantResponse
            .split(",")
            .map((feature) => feature.trim());
        console.log("CHATGPT suggested featureList", featureList);

        // // Update the displayed response
        // setResponse(assistantResponse);

        prompt_2 = "Explain why these features are interesting to analyze";
        // Append the new user message to the message history
        const updatedMessages_2: MessageHistory[] = [
            ...updatedMessagesWithResponse,
            { role: "user", content: prompt_2 },
        ];
        // setMessageHisto(updatedMessages_2);

        const completion_2 = await openai.chat.completions.create({
            model: MODEL,
            messages: updatedMessages_2, // Send the entire conversation history
        });

        const assistantResponse_2 =
            completion_2.choices[0].message.content || "";

        // Append the assistant's response to the message history
        const updatedMessagesWithResponse_2: MessageHistory[] = [
            ...updatedMessages_2,
            { role: "assistant", content: assistantResponse_2 },
        ];
        setMessageHisto(updatedMessagesWithResponse_2);
        console.log("message history", updatedMessagesWithResponse_2);

        // Update the displayed response
        setResponse(assistantResponse_2);
    } catch (error) {
        console.error("Error fetching response:", error);
    }

    handleGPTFeatureSuggestions(featureList);

    return featureList;
};

export { handleChatSubmit, handleChatSubmitSuggest };
