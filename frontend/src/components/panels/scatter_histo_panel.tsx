import React from "react";
import { PlotScatterplot } from "../visualisations/scatterplot";
import { PlotHisto } from "../visualisations/histogram";
import { Patient } from "../../data/Patient";

interface ScatterplotPanelProps {
  patients_data: Patient[];

  scatterplotFeatures: [string, string];

  catFeatures: string[];
  catFeature: string;
  setCatFeature: (v: string) => void;

  k: number;
}

export default function ScatterplotPanel({
  patients_data,
  scatterplotFeatures,
  catFeatures,
  catFeature,
  setCatFeature,
  k,
}: ScatterplotPanelProps) {
  const [x, y] = scatterplotFeatures;

  if (!x || !y) return <p>No features selected for scatterplot.</p>;

  const isHistogram = x === y;

  return (
    <div className="flex-container-column">
      <div className="pca-heading-container">
        {isHistogram ? (
          <h4 className="plot-headings">{y}</h4>
        ) : (
          <h4 className="plot-headings">
            {y} vs {x}
          </h4>
        )}

        <select
          id="catFeature"
          className="single-select-dropdown"
          value={catFeature}
          onChange={(e) => setCatFeature(e.target.value)}
        >
          {catFeatures.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {isHistogram ? (
        <PlotHisto patients_data={patients_data} selected_feature={x} k_mean_clusters={k} catFeature={catFeature} />
      ) : (
        <PlotScatterplot
          x_feature={x}
          y_feature={y}
          patients_data={patients_data}
          categoricalFeature={catFeature}
          k_mean_clusters={k}
          showCatLinReg={false}
          showCatAvg={true}
        />
      )}
    </div>
  );
}
