import { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/App.css";
import "./css/dropdown.css";
import "./css/Chat-sidePanel.css";
import "./css/FollowUpBubble.css";

import { cov_features } from "./data/variables_feature_lists";
import { handleChatSubmitSuggest, handleChatSubmit } from "./utils_chat/Chat";
import { LogPSX } from "./utils/HelperFunctions";

import SidePanel from "./components/panels/chat_sidepanel";
import MainPanel from "./components/panels/main_panel";

import { useLoadInitializeData } from "./hooks/useLoadInitializeData";
import { useChat } from "./hooks/useChat";
import { useVisStateFeatures } from "./hooks/useVisStateFeatures";

const DATASET_PATH = import.meta.env.BASE_URL + "/database/noisy.csv";
const DEBUG: boolean = false; // Set to false for production, TODO

// Activity 3 "Special Mode": lower-triangle-only heatmap, absolute correlation strength,
// Italian axis labels and chatbot. Opt in via the URL hash, e.g. https://host/#special-mode
function App() {
  document.body.classList.add("bg-dark", "text-white");
  console.log("App started");

  const specialMode = window.location.hash === "#special-mode";

  const {
    allFeatures,
    selectedCovFeatures,
    handleCheckboxChange,
    scatterplotFeatures,
    setScatterplotFeatures,
    heatmapSetsScatterplotFeatures,
    catFeatures,
    catFeature,
    setCatFeature,
    biplotFeatures,
    setBiplotFeatures,
  } = useVisStateFeatures();

  const promptRef = useRef<HTMLInputElement>(null!);
  const {
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
  } = useChat(allFeatures, setScatterplotFeatures, specialMode);

  const { patients_data, setPatientDataFunc, pcaLoadings, pearsonCorr, setPearsonCorr, dataLoaded, k, setK } =
    useLoadInitializeData(DEBUG, DATASET_PATH, setMessageHistoFun, setChatPearsonCorr, runInitialChatPrompt);

  // auto scroll to bottom of chat on new message
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shownMessages]);

  // handle siedpanelview
  const [showChat, setShowChat] = useState(true);
  const handleCloseChat = () => setShowChat(false);
  const handleShowChat = () => setShowChat(!showChat);

  // ------------------------- JSX -------------------------
  return (
    <>
      {dataLoaded ? (
        <>
          <div className="background-container">
            <h1 className="heading">
              {specialMode ? "Neurodegen-Vis: analisi della malattia di Parkinson" : "Neurodegen-Vis: Parkinson's disease analysis"}
            </h1>
            <p className="small text-secondary mb-1">
              {specialMode
                ? "Prototipo di ricerca · Non è un dispositivo medico · Non per uso clinico"
                : "Research prototype · Not a medical device · Not for clinical use"}
            </p>

            <div className="panels-container">
              {/* Sidepanel start */}
              <SidePanel
                showChat={showChat}
                onClose={handleCloseChat}
                clearChatHistory={clearChatHistory}
                submitPrompt={() =>
                  handleChatSubmit({
                    prompt: promptRef.current?.value || "",
                    messageHisto: messageHisto,
                    setMessageHistoFun: setMessageHistoFun,
                    shownMessages: shownMessages,
                    setShownMessages: setShownMessages,
                    handleChatFeatureSuggestions: handleChatFeatureSuggestion,
                    handleChatCodeResponse: handleChatCodeResponse,
                    setFollowUpQuestions: setFollowUpQuestionFun,
                  })
                }
                submitSuggest={() =>
                  handleChatSubmitSuggest({
                    prompt: promptRef.current?.value || "",
                    messageHisto: messageHisto,
                    setMessageHistoFun: setMessageHistoFun,
                    shownMessages: shownMessages,
                    setShownMessages: setShownMessages,
                    handleChatFeatureSuggestions: handleChatFeatureSuggestion,
                    handleChatCodeResponse: handleChatCodeResponse,
                    setFollowUpQuestions: setFollowUpQuestionFun,
                  })
                }
                promptRef={promptRef}
                messageHisto={messageHisto}
                sugFollowUpQuestions={sugFollowUpQuestions}
                shownMessages={shownMessages}
                setMessageHistoFun={setMessageHisto}
                setShownMessages={setShownMessages}
                handleChatFeatureSuggestions={handleChatFeatureSuggestion}
                handleChatCodeResponse={handleChatCodeResponse}
                setFollowUpQuestions={setFollowUpQuestionFun}
              />
              {/* Sidepanel end */}

              <MainPanel
                showChat={showChat}
                patients_data={patients_data}
                pearsonCorr={pearsonCorr}
                setPearsonCorr={setPearsonCorr}
                covFeatures={cov_features}
                selectedCovFeatures={selectedCovFeatures}
                handleCheckboxChange={handleCheckboxChange}
                scatterplotFeatures={scatterplotFeatures}
                heatmapSetsScatterplotFeatures={heatmapSetsScatterplotFeatures}
                chatFeatureSuggestion={chatFeatureSuggestion}
                chatFeatureHighlight={chatFeatureHighlight}
                catFeatures={catFeatures}
                catFeature={catFeature}
                setCatFeature={setCatFeature}
                biplotFeatures={biplotFeatures}
                setBiplotFeatures={setBiplotFeatures}
                pcaLoadings={pcaLoadings}
                k={k}
                setK={setK}
                setPatientDataFunc={setPatientDataFunc}
                handleShowChat={handleShowChat}
                specialMode={specialMode}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <p>loading data...</p>
          <LogPSX message="Loading data not finsished" logElement={dataLoaded} />
        </>
      )}
    </>
  );
}

export default App;
