// src/hooks/useChat.ts
import { useState, useRef, useEffect } from "react";
import { initialSystemPrompts } from "../utils_chat/system_prompts";
import { MessageHistory, ChatCodeRes } from "../utils_chat/types";
import { cov_features } from "../data/variables_feature_lists";
import * as d3 from "d3";
import { Patient } from "../data/Patient";
import { pearsonCorrelation } from "../utils/pearson_correlation";
import * as Plot from "@observablehq/plot";
import { handleChatSubmit, handleChatSubmitSuggest } from "../utils_chat/Chat";

import { pca_num_features_list, cov_features_init } from "../data/variables_feature_lists";

import { runKmeans } from "../utils/Kmean";
import { PCA_analysis } from "../utils/pca";

// const DATASET_PATH = import.meta.env.BASE_URL + "/database/noisy.csv";

export function useLoadInitializeData(
  DEBUG: boolean,
  DATASET_PATH: string,
  setMessageHistoFun: (messages: MessageHistory[]) => void,
  setChatPearsonCorr: (messages: MessageHistory[]) => void,
  runInitialChatPrompt: (messageHistoInit: MessageHistory[]) => void,
) {
  // todo, hard coded 54
  let emptyPatient: Patient = new Patient();
  const [patients_data, setPatientData] = useState<Patient[]>(Array(54).fill(emptyPatient));
  // const [patients_data, setPatientData] = useState<Patient[]>([]);

  function setPatientDataFunc(data: Patient[]) {
    console.log("Setting data...");
    setPatientData(data);
  }

  const [pcaLoadings, setPcaLoadings] = useState<number[][]>([]);
  const [pearsonCorr, setPearsonCorr] = useState<any[]>([]);

  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // kmeans
  const k_init = 2;
  const [k, setK] = useState<number>(k_init);

  function calcCorrelations(covFeatures: string[], patientsData: Patient[]) {
    return d3.cross(covFeatures, covFeatures).map(([a, b]) => ({
      a,
      b,
      correlation: pearsonCorrelation(Plot.valueof(patientsData, a) ?? [], Plot.valueof(patientsData, b) ?? []),
    }));
  }

  // ------------------------- Data loading and processing (hook) -------------------------
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
        runKmeans(patientDataLoaded, setPatientDataFunc, k);

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
          runInitialChatPrompt(messageHistoInit);
        }
      } catch (error) {
        console.error("Error loading data or running PCA:", error);
      }
    }
    loadAndProcessData();
  }, []);

  return {
    patients_data,
    setPatientDataFunc,
    pcaLoadings,
    pearsonCorr,
    setPearsonCorr,
    // chatPearsonCorr,
    // initialChatHistory,
    dataLoaded,
    k,
    setK,
  };
}
