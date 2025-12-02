import React from "react";
import Button from "react-bootstrap/Button";
import ReactMarkdown from "react-markdown";
import FollowUpBubbles from "../ui/FollowUpBubbles";
import { MessageHistory } from "../../utils_chat/types";
import { ChatCodeRes } from "../../utils_chat/types";
import "../../css/Chat-sidePanel.css";

interface SidePanelProps {
  showChat: boolean;
  onClose: () => void;

  // Chat logic passed in from parent
  promptRef: React.RefObject<HTMLInputElement>;
  clearChatHistory: () => void;
  submitPrompt: () => void;
  submitSuggest: () => void;

  // Current chat to show
  sugFollowUpQuestions: string[];
  shownMessages: MessageHistory[];

  // Functions to udate chat state in parent
  setShownMessages: (shownMessages: MessageHistory[]) => void;
  messageHisto: MessageHistory[];
  setMessageHistoFun: (messageHisto: MessageHistory[]) => void;
  handleChatFeatureSuggestions: (featureList: string[]) => void;
  handleChatCodeResponse: (codeResponse: ChatCodeRes) => void;
  setFollowUpQuestions: (questions: string[]) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({
  showChat,
  onClose,

  clearChatHistory,
  submitPrompt,
  submitSuggest,

  promptRef,
  // shownMessages: shownMessages,
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
    <div className={`sidepanel ${showChat ? "expanded" : "collapsed"}`}>
      {/* HEADER */}
      <div className="sidepanel-header">
        <h5>Chatbot</h5>
        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} />
      </div>

      {/* BODY */}
      <div className="sidepanel-body">
        {/* Chat input controls */}
        <div className="chat-prompt-container">
          <div className="container-suggest-clear-button">
            <Button variant="dark" onClick={clearChatHistory}>
              Clear History
            </Button>

            <div className="chat-suggest-button">
              <Button variant="dark" onClick={submitSuggest}>
                Suggest Features
              </Button>
            </div>
          </div>

          <p>Or ask your questions.</p>

          {/* Input + submit */}
          <div className="chat-textInput-container">
            <input type="text" ref={promptRef} placeholder="Enter your prompt here" />

            <Button variant="dark" onClick={submitPrompt}>
              Submit
            </Button>
          </div>

          <FollowUpBubbles
            sugFollowUpQuestions={sugFollowUpQuestions}
            messageHisto={messageHisto}
            setMessageHistoFun={setMessageHistoFun}
            shownMessages={shownMessages}
            setShownMessages={setShownMessages}
            handleChatFeatureSuggestions={handleChatFeatureSuggestions}
            handleChatCodeResponse={handleChatCodeResponse}
            setFollowUpQuestions={setFollowUpQuestions}
          />
        </div>

        {/* Chat history display */}
        <div className="chat-messages">
          {shownMessages
            .filter((msg) => msg.role === "user" || msg.role === "assistant")
            .map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role === "user" ? "user-message" : "assistant-message"}`}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;

//#endregion
