import { MessageHistory, ChatCodeRes } from "./types";
import { getChatResponse } from "../api/chat_response";
import { initialSystemPrompts, codePrompt } from "./system_prompts";

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
    const assistantResponse = await getChatResponse(updatedMessages);

    // Append the assistant's response to the message history
    const updatedMessagesWithResponse: MessageHistory[] = [
      ...updatedMessages,
      { role: "assistant", content: assistantResponse },
    ];

    console.log("Start Suggested follow-up questions:");

    const messagesForFollowup: MessageHistory[] = [
      ...updatedMessagesWithResponse,
      {
        role: "system",
        content:
          "Suggest one short and useful follow-question the user could ask! The answer should be only the question.",
      },
    ];
    const assistantResponseFollowUp: string[] = [await getChatResponse(messagesForFollowup)];

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

    const assistantResponse_code: string = await getChatResponse(updatedMessagesCode);

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
    const assistantResponse = await getChatResponse(updatedMessages);

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

    const assistantResponse_2 = await getChatResponse(updatedMessages_2);

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
