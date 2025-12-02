import { PlotCorHeatmap } from "../visualisations/heatmap";
import { Patient } from "../../env_dataset/Patient";
import Button from "react-bootstrap/Button";

interface HeatmapPanelProps {
  covFeatures: string[];
  selectedCovFeatures: string[];
  handleCheckboxChange: (f: string) => void;

  patients_data: Patient[];
  scatterplotFeatures: [string, string];
  heatmapSetsScatterplotFeatures: (f: [string, string]) => void;

  pearsonCorr: any[];
  setPearsonCorr: (v: any[]) => void;

  chatFeatureSuggestion: [string, string];
  chatFeatureHighlight: [string, string];

  handleShow: () => void;
}

export default function HeatmapPanel({
  covFeatures,
  selectedCovFeatures,
  handleCheckboxChange,

  patients_data,
  scatterplotFeatures,
  heatmapSetsScatterplotFeatures,

  pearsonCorr,
  setPearsonCorr,

  chatFeatureSuggestion,
  chatFeatureHighlight,
  handleShow,
}: HeatmapPanelProps) {
  return (
    <div className="flex-container-column">
      <div className="flex-container-row">
        <Button variant="dark" onClick={handleShow} className="show-chat-button">
          Show Chat assistant.
        </Button>
        <h3 className="pearsonCorrelation-heading">Pearson Correlation for selected features</h3>
      </div>

      <div className="checkbox-container">
        {covFeatures.map((feature) => (
          <label key={feature}>
            <input
              type="checkbox"
              checked={selectedCovFeatures.includes(feature)}
              onChange={() => handleCheckboxChange(feature)}
            />
            {feature}
          </label>
        ))}
      </div>

      <PlotCorHeatmap
        patients_data={patients_data}
        cov_features={selectedCovFeatures}
        selectedFeatures={scatterplotFeatures}
        chatFeatureSuggestion={chatFeatureSuggestion}
        chatFeatureHighlight={chatFeatureHighlight}
        setSelectedFeatures={heatmapSetsScatterplotFeatures}
        correlations={pearsonCorr}
        setCorrelations={setPearsonCorr}
      />
    </div>
  );
}
