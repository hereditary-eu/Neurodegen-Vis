import React from "react";
import Button from "react-bootstrap/Button";
import MultiSelectDropdown from "../ui/multiselectdropdown";
import { PlotPcaBiplot } from "../visualisations/pca_biplot";
import { Patient } from "../../data/Patient";
import { pca_num_features_list } from "../../data/variables_feature_lists";
import { runKmeans } from "../../utils/Kmean";

interface PcaPanelProps {
  patients_data: Patient[];
  pcaLoadings: number[][];
  biplotFeatures: string[];
  setBiplotFeatures: (biplotFeatures: string[]) => void;

  k: number;
  setK: (n: number) => void;
  setPatientDataFunc: (data: Patient[]) => void;

  // runKmeans: () => void;
}

export default function PcaPanel({
  patients_data,
  pcaLoadings,
  biplotFeatures,
  setBiplotFeatures,

  k,
  setK,
  setPatientDataFunc,

  // runKmeans,
}: PcaPanelProps) {
  return (
    <div>
      <div className="pca-heading-container">
        <h4 className="plot-headings">PCA Analysis</h4>

        <MultiSelectDropdown
          options={pca_num_features_list}
          selectedOptions={biplotFeatures}
          setSelectedOptions={setBiplotFeatures}
        />
      </div>

      <div className="kmeans-container">
        <label htmlFor="kmeans-input">Number of Clusters (k):</label>
        <input
          type="number"
          id="kmeans-input"
          value={k}
          onChange={(e) => setK(Number(e.target.value))}
          min="1"
          max="20"
        />
        <Button variant="dark" onClick={() => runKmeans(patients_data, setPatientDataFunc, k)}>
          Run
        </Button>
      </div>

      <PlotPcaBiplot
        patientsData={patients_data}
        numFeatures={pca_num_features_list}
        loadings={pcaLoadings}
        biplotFeatures={biplotFeatures}
        showKmeans={!(k === 1)}
      />
    </div>
  );
}
