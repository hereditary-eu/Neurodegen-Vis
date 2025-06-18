import OpenAI from "openai";
import dataFieldDescription from "./env_dataset/PD_DataFieldsDescription_plain.txt?raw";
import systemsSpecificifications from "./systems_specification_pd.json";

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

export const initialPrompt: MessageHistory[] = [
    {
        role: "system",
        content:
            "You are a helpful AI assistant, which helps user to understand a visual analytics dashboard." +
            "You should answer the users questions. Sometimes you should also provide typescript code for dashboard interaction" +
            "",
    },
    {
        role: "system",
        content:
            "This are the specifications of the Dashboard: " +
            JSON.stringify(systemsSpecificifications),
    },

    {
        role: "system",
        content: " Please answer all questions in a short and concise manner.",
    },
    {
        role: "system",
        content: "Description of the features:" + dataFieldDescription,
    },
];

interface ChatProps {
    prompt: string;
    messageHisto: MessageHistory[];
    setMessageHistoFun: (messageHisto: MessageHistory[]) => void;
    shownMessages: MessageHistory[];
    setShownMessages: (shownMessages: MessageHistory[]) => void;
    handleChatFeatureSuggestions: (featureList: string[]) => void;
}

const codePrompt =
    "There a different types of dashboard interaction, please provide the code in the described format (no additional text!)" +
    "json format with the following two key value pairs: " +
    "function: <valid_function>, code: <valid_code>" +
    "e.g. {function: highlightFeature, code: [<feature_name>, <feature_name>]}" +
    "The following valid functions are available: " +
    "1. 'highlightFeature': highlights the diagonal cell of a feature in the heatmap, needed input is a valid feature name twice in a list format, e.g. {code: [<feature_name>, <feature_name>]} " +
    "2. 'highlightFeatures': highlights the non-diagonal cell of the feature pair in the heatmap, needed input are two valid features in a list format e.g. {code: [<feature_name_1>, <feature_name_2>]} " +
    "Only return one single function if it is relevant to the users last question," +
    "<highlightFeature> for: explain this / what is this feature, or <highlightFeatures> for: what is the correlation between the features.." +
    "otherwise return an empty object {}";

const codePrompt2 = "Answer with yes";

const chatSubmitCodeResp = async (messageHisto: MessageHistory[]) => {
    // Append the new user message to the message history
    const updatedMessagesCode: MessageHistory[] = [
        ...messageHisto,
        {
            role: "system",
            // content: codePrompt,
            content: codePrompt2,
        },
    ];

    console.log("Messages for code generation:", updatedMessagesCode);

    // usless, only updated after the function call
    // setMessageHisto(updatedMessages);
    // setResponse("Generating response...");
    try {
        const completion = await openai.chat.completions.create({
            model: MODEL,
            messages: updatedMessagesCode, // Send the entire conversation history
        });

        console.log("Completion response for code generation:", completion);

        const assistantResponse = completion.choices[0].message.content || "";
        console.log(
            "Assistant response for code generation:",
            assistantResponse
        );
    } catch (error) {
        console.error("Error fetching response for code generation:", error);
        return {};
    }
};

function calcContentLength(messageHisto: MessageHistory[]) {
    return messageHisto.reduce((total, message) => {
        return total + message.content.length;
    }, 0);
}

const handleChatSubmit = async ({
    prompt,
    messageHisto,
    setMessageHistoFun: setMessageHisto,
    shownMessages,
    setShownMessages,
}: ChatProps) => {
    if (!prompt) {
        console.log("Prompt is empty");
        return;
    }

    // Append the new user message to the message history
    const updatedMessages: MessageHistory[] = [
        ...messageHisto,
        { role: "user", content: prompt },
    ];

    console.log(
        "Content length of message history:",
        calcContentLength(updatedMessages)
    );
    // Check if the content length exceeds the limit

    // usless, only updated after the function call
    // setMessageHisto(updatedMessages);

    // setResponse("Generating response...");
    setShownMessages([
        ...shownMessages,
        { role: "user", content: prompt },
        { role: "assistant", content: "Generating response..." },
    ]);

    try {
        // ----------------- Generate Chat Submit
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

        // code response
        console.log("Start code generation");
        // const codeResponse = chatSubmitCodeResp(updatedMessagesWithResponse);
        const updatedMessagesCode: MessageHistory[] = [
            ...updatedMessagesWithResponse,
            {
                role: "system",
                content: codePrompt,
            },
        ];

        console.log("Messages for code generation:", updatedMessagesCode);

        const completion_code = await openai.chat.completions.create({
            model: MODEL,
            messages: updatedMessagesCode, // Send the entire conversation history
        });

        console.log(
            "Completion response for code generation:",
            completion_code
        );

        const assistantResponse_code =
            completion_code.choices[0].message.content || "nothing?";
        console.log(
            "Assistant response for code generation:",
            assistantResponse_code
        );

        setMessageHisto(updatedMessagesWithResponse);
        console.log("message history", updatedMessagesWithResponse);

        // Update the displayed response
        setShownMessages([
            ...shownMessages,
            { role: "user", content: prompt },
            { role: "assistant", content: assistantResponse },
        ]);
    } catch (error) {
        console.error("Error fetching response:", error);
    }

    // ---------------------------- Generate code response ----------------------------
    try {
        // console.log("Start code generation");
        // // const codeResponse = chatSubmitCodeResp(updatedMessagesWithResponse);
        // const updatedMessagesCode: MessageHistory[] = [
        //     ...messageHisto,
        //     {
        //         role: "system",
        //         content: codePrompt,
        //     },
        // ];
        // console.log("Messages for code generation:", updatedMessagesCode);
        // const completion_code = await openai.chat.completions.create({
        //     model: MODEL,
        //     messages: updatedMessagesCode, // Send the entire conversation history
        // });
        // console.log(
        //     "Completion response for code generation:",
        //     completion_code
        // );
        // const assistantResponse_code =
        //     completion_code.choices[0].message.content || "nothing?";
        // console.log(
        //     "Assistant response for code generation:",
        //     assistantResponse_code
        // );
    } catch (error) {
        console.error("Error fetching response for code generation:", error);
    }
};

const handleChatSubmitSuggest = async ({
    prompt,
    messageHisto,
    setMessageHistoFun: setMessageHisto,
    shownMessages,
    setShownMessages,
    handleChatFeatureSuggestions: handleChatFeatureSuggestions,
}: ChatProps) => {
    // setResponse("Generating suggestions...");
    setShownMessages([
        ...shownMessages,
        { role: "user", content: "Suggest Features!" },
        { role: "assistant", content: "Generating response..." },
    ]);

    console.log("Length of message history:", messageHisto.length);

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
        setShownMessages([
            ...shownMessages,
            { role: "user", content: "Suggest Features!" },
            { role: "assistant", content: assistantResponse_2 },
        ]);
    } catch (error) {
        console.error("Error fetching response:", error);
    }

    handleChatFeatureSuggestions(featureList);

    return featureList;
};

interface clearChatHistoryProps {
    setMessageHistoFun: (messageHisto: MessageHistory[]) => void;
    setShownMessages: (shownMessages: MessageHistory[]) => void;
    initialPrompt: MessageHistory[];
}
const clearChatHistory = ({
    setMessageHistoFun: setMessageHisto,
    setShownMessages,
    initialPrompt,
}: clearChatHistoryProps) => {
    // Clear the message history
    setMessageHisto(initialPrompt);
    setShownMessages([]);
    console.log("Cleared message history");
};

export { handleChatSubmit, handleChatSubmitSuggest, clearChatHistory };
