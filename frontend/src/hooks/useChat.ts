// src/hooks/useChat.ts
import { useState, useRef } from "react";
import { initialSystemPrompts } from "../utils_chat/system_prompts";
import { MessageHistory, ChatCodeRes } from "../utils_chat/types";
import { cov_features } from "../data/variables_feature_lists";
import { handleChatSubmitSuggest, handleChatSubmit } from "../utils_chat/Chat";

export function useChat(allFeatures: string[], setScatterplotFeatures: (features: [string, string]) => void) {
  // ------------------------- chat (hook)-------------------------

  // use ref to avoid re-rendering for the input field for every key stroke
  // const promptRef = useRef<HTMLInputElement>(null);

  const [shownMessages, setShownMessages] = useState<MessageHistory[]>([]);
  const [messageHisto, setMessageHisto] = useState<MessageHistory[]>(initialSystemPrompts);
  const [chatFeatureSuggestion, setChatFeatureSuggestion] = useState<[string, string]>(["", ""]);
  const [chatFeatureHighlight, setChatFeatureHighlight] = useState<[string, string]>(["", ""]);
  const [chatPearsonCorr, setChatPearsonCorr] = useState<MessageHistory[]>([]);
  const [sugFollowUpQuestions, setSugFollowUpQuestions] = useState<string[]>([]);

  function clearChatHistory() {
    setMessageHisto([...initialSystemPrompts, ...chatPearsonCorr]);
    setShownMessages([]);
    console.log("Cleared chat history");
  }

  function setFollowUpQuestionFun(questions: string[]) {
    console.log("Follow-up questions updated:", questions);
    setSugFollowUpQuestions(questions);
  }

  function setMessageHistoFun(messages: MessageHistory[]) {
    setMessageHisto(messages);
    console.log("Message history updated:", messages);
  }

  function handleChatFeatureSuggestion(featureList: string[]) {
    // check if the features are valid in in the data
    if (featureList.every((feature) => allFeatures.includes(feature))) {
      console.log("Valid feature suggestion: ", featureList);
      setScatterplotFeatures([featureList[0], featureList[1]]);
      setChatFeatureSuggestion([featureList[0], featureList[1]]);
      return;
    } else {
      console.log("Invalid feature suggestion: ", featureList);
    }

    return;
  }

  function handleChatCodeResponse(codeResponse: ChatCodeRes) {
    // Handle the code response from the chat
    console.log("Chat code response received:", codeResponse);
    switch (codeResponse.functionName) {
      case "highlightFeature":
      case "highlightFeatures":
        // highlight feature(s) in the heatmap
        console.log("Chat code response: HighlightFeature(S) case triggered");
        const featureList: string[] = codeResponse.code;
        if (featureList.length === 2 && featureList.every((feature) => cov_features.includes(feature))) {
          console.log("Valid feature highlighted: ", featureList);
          // setChatFeatureHighlight([featureList[0], featureList[1]]);
          setChatFeatureSuggestion([featureList[0], featureList[1]]);
          setScatterplotFeatures([featureList[0], featureList[1]]);

          return;
        } else {
          console.log("Invalid feature highlighted: ", featureList);
        }
        break;

      case "none":
        // No specific action needed
        console.log("Chat code response: None case triggered");
        break;
      default:
        console.log("Chat code response: Invalid function name:", codeResponse.functionName);
    }
  }

  function runInitialChatPrompt(messageHistoInit: MessageHistory[]) {
    handleChatSubmit({
      prompt: "Can you give a short overview of the data and the dashboard?",
      messageHisto: messageHistoInit,
      setMessageHistoFun,
      shownMessages: [],
      setShownMessages: setShownMessages,
      handleChatFeatureSuggestions: handleChatFeatureSuggestion,
      handleChatCodeResponse: handleChatCodeResponse,
      setFollowUpQuestions: setFollowUpQuestionFun,
    });
  }

  return {
    // promptRef,
    shownMessages,
    setShownMessages,
    messageHisto,
    setMessageHisto,
    setMessageHistoFun,
    chatFeatureSuggestion,
    chatFeatureHighlight,
    chatPearsonCorr,
    setChatPearsonCorr,
    sugFollowUpQuestions,
    clearChatHistory,
    setFollowUpQuestionFun,
    handleChatFeatureSuggestion,
    handleChatCodeResponse,
    runInitialChatPrompt,
  };
}
