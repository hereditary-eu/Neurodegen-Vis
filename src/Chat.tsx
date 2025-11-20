import OpenAI from "openai";
import dataFieldDescription from "./env_dataset/PD_DataFieldsDescription_plain.txt?raw";
import systemsSpecificifications from "./systems_specification_pd.json";

export interface MessageHistory {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ChatCodeRes {
  functionName: string = "";
  code: string[] = ["", ""]; // todo, make different types of code possible!

  /**
   * Genreates ChatCodeRes instance from a JSON string, and checks if the JSON is valid.
   * @returns chatCodeRes instance
   */
  static fromJSON(json: string): ChatCodeRes {
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid JSON format for ChatCodeRes");
    }

    // check if obj has keys function and code
    const hasExactKeys = (obj: any, keys: string[]): boolean => {
      const objKeys = Object.keys(obj).sort();
      const expectedKeys = keys.slice().sort();
      return objKeys.length === expectedKeys.length && objKeys.every((key, i) => key === expectedKeys[i]);
    };

    if (!hasExactKeys(obj, ["code", "function"])) {
      throw new Error(
        "Object must contain exactly the keys 'code' and 'function', but got: " + JSON.stringify(Object.keys(obj)),
      );
    }

    if (!obj.function || typeof obj.function !== "string") {
      throw new Error(
        "Invalid or missing 'function' in JSON, function must be a string, but got: " + JSON.stringify(obj.function),
      );
    }
    // check if code an array of strings
    if (!obj.code || !Array.isArray(obj.code) || !obj.code.every((item: any) => typeof item === "string")) {
      throw new Error(
        "Invalid or missing 'code' in JSON — must be array of strings, but got: " + JSON.stringify(obj.code),
      );
    }

    const instance = new ChatCodeRes();
    instance.functionName = obj.function;
    instance.code = obj.code; //
    return instance;
  }
}

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // TODO, Allow the API to be used in the browser, not recommended for production
});

const MODEL = "gpt-4o-mini";
// MODEL = "gpt-3.5-turbo";

export const initialSystemPrompts: MessageHistory[] = [
  {
    role: "system",
    content:
      "You are a helpful AI assistant, which helps user to understand a visual analytics dashboard." +
      // "You should answer the users questions." +
      // "Sometimes you should also provide typescript code for dashboard interaction" +
      "",
  },
  {
    role: "system",
    content: " Please answer all questions in a short and concise manner.",
  },
  {
    role: "system",
    content: "This are the specifications of the Dashboard: " + JSON.stringify(systemsSpecificifications),
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
  handleChatCodeResponse: (codeResponse: ChatCodeRes) => void;
  setFollowUpQuestions: (questions: string[]) => void;
}

const codePrompt =
  "There are different types of dashboard interactions. " +
  "If a function is helpful to answer the  user's last question, return only the single most relevant function, otherwise return the non function. " +
  "Please provide the code in the following format (no additional text!): " +
  "a JSON object with two key-value pairs: " +
  '{"function": "valid_function", "code": "valid_code"} ' +
  'For example: {"function": "highlightFeature", "code": ["<feature_name>", "<feature_name>"]} ' +
  "Valid function options: " +
  '1. "highlightFeatures": highlights a non-diagonal cell representing the feature pair in the heatmap. Changes the scatterplot view to these features. Input: two distinct feature names, e.g. {"code": ["featureA", "featureB"]} ' +
  '2. "highlightFeature": highlights a diagonal cell of the feature in the correlation heatmap. Changes the histogram view to this feature. Input: a list with the same feature name twice, e.g. {"code": ["featureX", "featureX"]} ' +
  "Only return one single function, based on the user's last question. " +
  'Use "highlightFeatures" for questions about two features like: "What is the correlation"/"dependency"/"relationship between features", or wherever it could be useful.. ' +
  'Use "highlightFeature" for question about one feature like: "what is this feature", "explain this feature", or wherever it could be useful. ' +
  'If no function is relevant to the users last question, return {"function": "none", "code": ["none"]}';

// const codePrompt2 = "Answer with yes";

const chatSubmitCodeResp = async (messageHisto: MessageHistory[]) => {
  // Append the new user message to the message history
  const updatedMessagesCode: MessageHistory[] = [
    ...messageHisto,
    {
      role: "system",
      content: codePrompt,
      // content: codePrompt2,
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
    console.log("Assistant response for code generation:", assistantResponse);
  } catch (error) {
    console.error("Error fetching response for code generation:", error);
    return {};
  }
};

/**
 * Calculates the total content length of the message history.
 */
function calcContentLength(messageHisto: MessageHistory[]) {
  return messageHisto.reduce((total, message) => {
    return total + message.content.length;
  }, 0);
}

/**
 * Handles the chat submission, by:
 * 1. answering the user's prompt
 * 2. calling code generation to manipulate the dashboard if needed
 * 3. generating follow-up questions.
 *
 * Updates the message history, shown messages and the follow-up question accordingly.
 */
const handleChatSubmit = async ({
  prompt,
  messageHisto,
  setMessageHistoFun: setMessageHisto,
  shownMessages,
  setShownMessages,
  handleChatCodeResponse,
  setFollowUpQuestions,
}: ChatProps) => {
  if (!prompt) {
    console.log("Prompt is empty");
    return;
  }

  // Append the new user message to the message history
  const updatedMessages: MessageHistory[] = [...messageHisto, { role: "user", content: prompt }];

  console.log("Content length of message history:", calcContentLength(updatedMessages));
  // Check if the content length exceeds the limit

  // usless, only updated after the function call
  // setMessageHisto(updatedMessages);

  // setResponse("Generating response...");
  setShownMessages([
    ...shownMessages,
    { role: "user", content: prompt },
    { role: "assistant", content: "Generating response..." },
  ]);

  let codeResponse: ChatCodeRes = new ChatCodeRes();

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

    console.log("Start Suggested follow-up questions:");
    const completetion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        ...updatedMessagesWithResponse,
        {
          role: "system",
          content: "Suggest one short and useful follow-question the user could ask!",
        },
      ], // Send the entire conversation history
    });
    const assistantResponseFollowUp: string[] = [completetion.choices[0].message.content || ""];

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

    // console.log(
    //     "Completion response for code generation:",
    //     completion_code
    // );

    const assistantResponse_code = completion_code.choices[0].message.content || "nothing?";
    console.log("Assistant response for code generation:", assistantResponse_code);

    try {
      codeResponse = ChatCodeRes.fromJSON(assistantResponse_code);
      console.log("Parsed code response:", codeResponse);

      handleChatCodeResponse(codeResponse);
      // codeResponse = codeResponse_;
    } catch (error) {
      console.error("Error parsing following code response:", assistantResponse_code);
      console.error("Error message:", error);
    }

    setMessageHisto(updatedMessagesWithResponse);
    console.log("message history", updatedMessagesWithResponse);

    // Update the displayed response
    setShownMessages([
      ...shownMessages,
      { role: "user", content: prompt },
      { role: "assistant", content: assistantResponse },
    ]);

    setFollowUpQuestions(assistantResponseFollowUp);
  } catch (error) {
    console.error("Error fetching response:", error);
  }

  console.log("Code response:", codeResponse);
  return;
};

/**
 * Handles the chat submission for feature suggestions, by:
 * 1. Letting the LM suggest two features to analyze.
 * 2. Letting the LM  explain why these features are interesting, and set the shown messages accordingly.
 * 3. updating the feature list and therefore the highlight heatmap and scatterplot in the parent component through handleChatFeatureSuggestions.
 */
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
    "What could be two to interesting features to analyze in a scatterplot. Consider previous prompts, but suggest new features. Your answer should be the two features, seperated through a comma. No additional text.";
  // Append the new user message to the message history
  const updatedMessages: MessageHistory[] = [...messageHisto, { role: "user", content: prompt_2 }];
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

    featureList = assistantResponse.split(",").map((feature) => feature.trim());
    console.log("CHATGPT suggested featureList", featureList);

    // // Update the displayed response
    // setResponse(assistantResponse);

    prompt_2 = "Explain why these features are interesting to analyze";
    // Append the new user message to the message history
    const updatedMessages_2: MessageHistory[] = [...updatedMessagesWithResponse, { role: "user", content: prompt_2 }];
    // setMessageHisto(updatedMessages_2);

    const completion_2 = await openai.chat.completions.create({
      model: MODEL,
      messages: updatedMessages_2, // Send the entire conversation history
    });

    const assistantResponse_2 = completion_2.choices[0].message.content || "";

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

export { handleChatSubmit, handleChatSubmitSuggest }; //, clearChatHistory
