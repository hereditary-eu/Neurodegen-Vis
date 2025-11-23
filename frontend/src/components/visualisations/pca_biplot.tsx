import { Patient } from "../../env_dataset/Patient";
import { PCA } from "ml-pca";
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import { CalcMinMaxMatrix } from "../../HelperFunctions";
import { FONTSIZE, CLUSTERCOLORS } from "./vis_variables";
import { PCA_analysis } from "../utils/pca";

/**
 * Generates loading vectors for PCA biplot visualization.
 */
function getLoadingsForPlot(feature_num: number, loadings: number[][], loadingScaleFactor: number, features: string[]) {
  const loadingsForPlot = [
    { x: 0, y: 0 },
    {
      x: loadings[feature_num][0] * loadingScaleFactor,
      y: loadings[feature_num][1] * loadingScaleFactor,
      feature: features[feature_num],
    },
  ];

  return {
    line: Plot.line(loadingsForPlot, {
      x: "x",
      y: "y",
      stroke: "red",
      strokeWidth: 2,
      markerEnd: "arrow", // Arrow tip to indicate direction
    }),

    text: Plot.text([loadingsForPlot[1]], {
      x: "x",
      y: "y",
      text: "feature",
      // dx: 10,
      dy: -10 * Math.sign(loadingsForPlot[1].y),
      fontSize: 13,
      fill: "white",
    }),
  };
}

interface PCAPlotProps {
  patientsData: Patient[];
  numFeatures: string[];
  loadings: number[][];
  biplotFeatures: string[];
  showKmeans: boolean;
}
/**
 * Creates and renders the PCA biplot, including PCA projections and loading vectors.
 */
function PlotPcaBiplot({
  patientsData: patientsData,
  numFeatures: numFeatures,
  biplotFeatures: biplotFeatures,
  showKmeans: showKmeans,
  loadings: loadings,
}: PCAPlotProps) {
  function createPlot() {
    console.log("PCA Plot started");

    const patientsDataValid = patientsData.filter((patient) => patient.valid_pc);

    const pcaProjections: number[][] = patientsDataValid.map((patient) => [patient.pc1, patient.pc2]);

    const validClusters: number[] = patientsDataValid.map((patient) => patient.k_mean_cluster);

    const [min_x, , min_y] = CalcMinMaxMatrix({
      matrix: pcaProjections,
      feature_1: 0,
      feature_2: 1,
    });

    const loadingScaleFactor = 2.2;

    const loadingLines: Plot.Markish[] = [];
    const loadingTexts: Plot.Markish[] = [];

    let show_features = biplotFeatures.map((x) => numFeatures.indexOf(x));
    // console.log("show_features", show_features);

    for (let i = 0; i < show_features.length; i++) {
      let j = show_features[i];
      const loadingMark = getLoadingsForPlot(j, loadings, loadingScaleFactor, numFeatures);
      loadingLines.push(loadingMark.line);
      loadingTexts.push(loadingMark.text);
    }

    const loadingMarks = [...loadingLines, ...loadingTexts];

    const pca_scatterplot = Plot.plot({
      marginBottom: 40,
      marks: [
        Plot.dot(pcaProjections, {
          x: (d) => d[0],
          y: (d) => d[1],
          tip: true,
          title: (d, i) =>
            "Patient ID: " +
            patientsDataValid[i]["record_id"] +
            "\n" +
            "Cluster " +
            validClusters[i] +
            "\n" + // Cluster number
            "PC 1: " +
            d[0].toFixed(2) +
            "\n" + // PC1
            "PC 2: " +
            d[1].toFixed(2) +
            "\n" + // PC2
            biplotFeatures
              .map(
                (feature) =>
                  feature +
                  ": " +
                  (typeof patientsDataValid[i][feature] === "number"
                    ? patientsDataValid[i][feature].toFixed(2)
                    : patientsDataValid[i][feature]),
              )
              .join("\n"), // Show all biplot feature values
          ...(showKmeans
            ? {
                stroke: (_, i) => CLUSTERCOLORS[validClusters[i]],
              }
            : {}),
        }),
        Plot.ruleY([min_y]),
        Plot.ruleX([min_x]),
        Plot.ruleY([0]),
        Plot.ruleX([0]),
        ...loadingMarks,
      ],
      x: {
        label: "Principal Component 1",
      },
      y: {
        label: "Principal Component 2",
      },
      style: "--plot-background: black; font-size: " + FONTSIZE,
    });
    return pca_scatterplot;
  }

  const pca_scatterplot_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element
  useEffect(() => {
    if (pca_scatterplot_ref.current) {
      pca_scatterplot_ref.current.innerHTML = ""; // Clear the div
      pca_scatterplot_ref.current.appendChild(createPlot());
    }
  }, [patientsData, numFeatures, biplotFeatures]);

  return <div ref={pca_scatterplot_ref} />;
}

export { PlotPcaBiplot };
