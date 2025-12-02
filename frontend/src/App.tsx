import { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./css/App.css";
import "./css/dropdown.css";
import "./css/Chat-sidePanel.css";
import "./css/FollowUpBubble.css";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";

import { Patient } from "./env_dataset/Patient";
import {
  pca_num_features_list,
  cat_features_mapping,
  cat_features_generic,
  cov_features,
  cov_features_init,
  scatterplot_features_init,
  biplot_features_init,
} from "./env_dataset/variables_feature_lists";

import { PCA_analysis } from "./utils/pca";
import { handleChatSubmitSuggest, handleChatSubmit } from "./utils_chat/Chat";
import { initialSystemPrompts } from "./utils_chat/system_prompts";
import { ChatCodeRes } from "./utils_chat/types";
import { MessageHistory } from "./utils_chat/types";
import { pearsonCorrelation } from "./utils/pearson_correlation";

import { RunKmeans } from "./utils/Kmean";

import SidePanel from "./components/panels/chat_sidepanel";
import MainPanel from "./components/panels/main_panel";

const DATASET_PATH = import.meta.env.BASE_URL + "/database/noisy.csv";

const DEBUG: boolean = false; // Set to false for production, TODO

interface logPSXProps {
  message: string;
  logElement: any;
}

/**
 * Dev helper function to log messages and elements to the console.
 */
function LogPSX({ message, logElement }: logPSXProps) {
  console.log(message, logElement);
  return <></>;
}

function App() {
  document.body.classList.add("bg-dark", "text-white");

  console.log("App started");

  // all features should be all the keys from the Patient class
  const allFeatures = Object.keys(new Patient());

  const [selectedCovFeatures, setSelectedCovFeatures] = useState<string[]>(cov_features_init);

  const handleCheckboxChange = (feature: string) => {
    setSelectedCovFeatures((prevSelected) => {
      if (prevSelected.includes(feature)) {
        // If feature is already selected, remove it
        return prevSelected.filter((f) => f !== feature);
      } else {
        // Otherwise, add the feature
        return [...prevSelected, feature];
      }
    });
  };

  const [scatterplotFeatures, setScatterplotFeatures] = useState<[string, string]>(scatterplot_features_init);

  const [catFeatures, setCatFeatures] = useState<string[]>(
    cat_features_generic.concat(cat_features_mapping[scatterplotFeatures[1]]),
  );

  // ToDO always resets to k_mean_cluster
  const [catFeature, setCatFeature] = useState<string>(catFeatures[1]);

  function heatmapSetsScatterplotFeatures(features: [string, string]) {
    setScatterplotFeatures(features);

    let scatterplotCatFeatures: string[] = cat_features_generic;

    // console.log("z Methods", Object.keys(zTestMethodsMapping));
    if (Object.keys(cat_features_mapping).includes(features[1])) {
      // scatterplotCatFeatures;
      scatterplotCatFeatures = scatterplotCatFeatures.concat(cat_features_mapping[features[1]]);

      setCatFeatures(scatterplotCatFeatures);
      setCatFeature(scatterplotCatFeatures[1]);
    } else {
      setCatFeatures(cat_features_generic);

      // TODO always resets to k_mean_cluster
      setCatFeature("k_mean_cluster");
    }
  }

  // features for PCA, biplot axis:
  const [biplotFeatures, setBiplotFeatures] = useState<string[]>(biplot_features_init);

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // correlations of format {a: "feature1", b: "feature2", correlation: 0.8}
  const [pearsonCorr, setPearsonCorr] = useState<
    {
      a: string;
      b: string;
      correlation: number;
    }[]
  >([]);

  // todo, hard coded 54
  let emptyPatient: Patient = new Patient();
  const [patients_data, setPatientData] = useState<Patient[]>(Array(54).fill(emptyPatient));
  function setPatientDataFunc(data: Patient[]) {
    console.log("Setting data...");
    setPatientData(data);
  }

  const [pcaLoadings, setPcaLoadings] = useState<number[][]>([]); // Use state to store pcaLoadings

  // kmeans
  const k_init = 2;
  const [k, setK] = useState<number>(k_init);

  function calcCorrelations(covFeatures: string[], patientsData: Patient[]) {
    let correlations = d3.cross(covFeatures, covFeatures).map(([a, b]) => ({
      a,
      b,
      correlation: pearsonCorrelation(Plot.valueof(patientsData, a) ?? [], Plot.valueof(patientsData, b) ?? []),
    }));
    return correlations;
  }

  // Initializing website, loading data, running PCA and Kmeans, and other things for the first time
  useEffect(() => {
    console.log("Loading data...");
    async function loadAndProcessData() {
      try {
        // Step 1: Load Data
        console.log("Loading dataset from:", DATASET_PATH);
        // print if dataset exists
        const datasetExists = await fetch(DATASET_PATH).then((res) => res.ok);
        console.log("Dataset exists:", datasetExists);

        const patientDataLoaded = (await d3.csv(DATASET_PATH)).map((r) => Patient.fromJson(r));
        console.log("Data loaded!", patientDataLoaded);

        // Step 2: Run PCA Analysis
        const newPcaLoadings = PCA_analysis({
          patientsData: patientDataLoaded,
          numFeatures: pca_num_features_list,
        });

        // Run Kmeans
        RunKmeans(patientDataLoaded, setPatientDataFunc, k);

        // Step 3: Update State
        setPatientData(patientDataLoaded);
        setPcaLoadings(newPcaLoadings);
        setDataLoaded(true); // Set this last to indicate both processes are done

        const correlations = calcCorrelations(cov_features_init, patientDataLoaded);
        setPearsonCorr(correlations);

        const chatPearsonCorrTemp: MessageHistory[] = [
          {
            role: "system",
            content:
              "Pearson correlations from some features in format {a: 'feature1', b: 'feature2', correlation: 'number'}" +
              JSON.stringify(correlations),
          },
        ];
        const messageHistoInit: MessageHistory[] = [...initialSystemPrompts, ...chatPearsonCorrTemp];

        setMessageHistoFun(messageHistoInit);
        setChatPearsonCorr(chatPearsonCorrTemp);

        if (!DEBUG) {
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

          setShowChat(true); // Automatically show chat on load
        }
      } catch (error) {
        console.error("Error loading data or running PCA:", error);
      }
    }
    loadAndProcessData();
  }, []);

  // ------------------------- chat -------------------------
  // use ref to avoid re-rendering for the input field for every key stroke
  const promptRef = useRef<HTMLInputElement>(null);
  // const [response, setResponse] = useState<string>("");

  const [shownMessages, setShownMessages] = useState<MessageHistory[]>([]);
  const [messageHisto, setMessageHisto] = useState<MessageHistory[]>(initialSystemPrompts);
  const [chatFeatureSuggestion, setChatFeatureSuggestion] = useState<[string, string]>(["", ""]);
  const [chatFeatureHighlight, setChatFeatureHighlight] = useState<[string, string]>(["", ""]);
  const [chatPearsonCorr, setChatPearsonCorr] = useState<MessageHistory[]>([]);

  function clearChatHistory() {
    setMessageHisto([...initialSystemPrompts, ...chatPearsonCorr]);
    setShownMessages([]);
    console.log("Cleared chat history");
  }

  const [sugFollowUpQuestions, setSugFollowUpQuestions] = useState<string[]>([]);

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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shownMessages]);

  // handle offcanvas
  const [showChat, setShowChat] = useState(false);
  const handleClose = () => setShowChat(false);
  const handleShow = () => setShowChat(!showChat);

  // ------------------------- JSX -------------------------
  return (
    <>
      {dataLoaded ? (
        <>
          <div className="background-container">
            <h1 className="heading">Neurodegen-Vis: Parkinson's disease analysis</h1>

            <div className="panels-container">
              {/* Sidepanel start */}
              <SidePanel
                showChat={showChat}
                onClose={handleClose}
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
                runKmeans={() => RunKmeans(patients_data, setPatientDataFunc, k)}
                handleShowChat={handleShow}
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
