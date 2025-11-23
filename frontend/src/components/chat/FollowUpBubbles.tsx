import React, { useState } from "react";
import {
  handleChatSubmitSuggest,
  // clearChatHistory,
  handleChatSubmit,
  MessageHistory,
  initialSystemPrompts,
  ChatCodeRes,
} from "./Chat";

interface FollowUpBubblesProps {
  sugFollowUpQuestions: string[];
  messageHisto: MessageHistory[];
  setMessageHistoFun: (messages: MessageHistory[]) => void;
  shownMessages: MessageHistory[];
  setShownMessages: (messages: MessageHistory[]) => void;
  handleChatFeatureSuggestions: (featureList: string[]) => void;
  handleChatCodeResponse: (codeResponse: ChatCodeRes) => void;
  setFollowUpQuestions: (questions: string[]) => void;
  // handleChatSubmit: (prompt: string) => void;
}

const FollowUpBubbles: React.FC<FollowUpBubblesProps> = ({
  sugFollowUpQuestions,
  messageHisto,
  setMessageHistoFun,
  shownMessages,
  setShownMessages,
  handleChatFeatureSuggestions,
  handleChatCodeResponse,
  setFollowUpQuestions,
}) => {
  return (
    <div className="follow-up-container">
      {/* <h5 className="follow-up-heading">Suggested Follow-up Questions</h5> */}
      <div className="bubble-wrapper">
        {sugFollowUpQuestions.map((question, idx) => (
          <button
            key={idx}
            onClick={() =>
              handleChatSubmit({
                prompt: question,
                messageHisto,
                setMessageHistoFun,
                shownMessages,
                setShownMessages,
                handleChatFeatureSuggestions,
                handleChatCodeResponse,
                setFollowUpQuestions,
              })
            }
            className="bubble-button"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpBubbles;
