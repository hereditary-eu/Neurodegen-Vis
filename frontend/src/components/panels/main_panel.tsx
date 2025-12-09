import React from "react";
import HeatmapPanel from "./heatmap_panel";
import ScatterplotPanel from "./scatter_histo_panel";
import PcaPanel from "./pca_panel";
import Button from "react-bootstrap/Button";
import { Patient } from "../../data/Patient";
import { MessageHistory } from "../../utils_chat/types";

interface MainPanelProps {
  showChat: boolean;

  // Data
  patients_data: Patient[];
  pearsonCorr: any[];
  setPearsonCorr: (v: any[]) => void;

  // Heatmap
  covFeatures: string[];
  selectedCovFeatures: string[];
  handleCheckboxChange: (f: string) => void;
  scatterplotFeatures: [string, string];
  heatmapSetsScatterplotFeatures: (f: [string, string]) => void;
  chatFeatureSuggestion: [string, string];
  chatFeatureHighlight: [string, string];

  // Scatterplot
  catFeatures: string[];
  catFeature: string;
  setCatFeature: (v: string) => void;

  // PCA panel
  biplotFeatures: string[];
  setBiplotFeatures: (v: string[]) => void;
  pcaLoadings: number[][];
  k: number;
  setK: (n: number) => void;
  // runKmeans: () => void;
  setPatientDataFunc: (data: Patient[]) => void;
  handleShowChat: () => void;
}

export default function MainPanel({
  showChat,
  patients_data,
  pearsonCorr,
  setPearsonCorr,

  covFeatures,
  selectedCovFeatures,
  scatterplotFeatures,
  heatmapSetsScatterplotFeatures,
  handleCheckboxChange,
  chatFeatureSuggestion,
  chatFeatureHighlight,

  catFeatures,
  catFeature,
  setCatFeature,

  biplotFeatures,
  setBiplotFeatures,
  pcaLoadings,
  k,
  setK,
  setPatientDataFunc,
  // runKmeans,
  handleShowChat,
}: MainPanelProps) {
  // const handleShow = () => setShowChat(!showChat);

  return (
    <div className={`mainpanel ${showChat ? "sp-expanded" : "sp-collapsed"}`}>
      <div className="heatmap-scatterplots-grid">
        {/* 1 — HEATMAP PANEL */}
        <HeatmapPanel
          covFeatures={covFeatures}
          selectedCovFeatures={selectedCovFeatures}
          handleCheckboxChange={handleCheckboxChange}
          patients_data={patients_data}
          scatterplotFeatures={scatterplotFeatures}
          heatmapSetsScatterplotFeatures={heatmapSetsScatterplotFeatures}
          pearsonCorr={pearsonCorr}
          setPearsonCorr={setPearsonCorr}
          chatFeatureSuggestion={chatFeatureSuggestion}
          chatFeatureHighlight={chatFeatureHighlight}
          handleShow={handleShowChat}
        />

        {/* 2 — SCATTERPLOT / HISTOGRAM PANEL */}
        <div className="flex-container-column ">
          <ScatterplotPanel
            patients_data={patients_data}
            scatterplotFeatures={scatterplotFeatures}
            catFeatures={catFeatures}
            catFeature={catFeature}
            setCatFeature={setCatFeature}
            k={k}
          />

          {/* 3 — PCA / KMEANS PANEL */}
          <PcaPanel
            patients_data={patients_data}
            biplotFeatures={biplotFeatures}
            setBiplotFeatures={setBiplotFeatures}
            pcaLoadings={pcaLoadings}
            k={k}
            setK={setK}
            setPatientDataFunc={setPatientDataFunc}
            // runKmeans={runKmeans}
          />
        </div>
      </div>
    </div>
  );
}
