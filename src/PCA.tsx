import { Patient } from "./env_dataset/Patient";
import { PCA } from "ml-pca";
import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";
import { CalcMinMaxMatrix } from "./HelperFunctions";

const FONTSIZE = "14px";

const CLUSTERCOLORS = [
  "#1f77b4", // Blue
  "#ff7f0e", // Orange
  "#2ca02c", // Green
  "#9467bd", // Purple
  "#8c564b", // Brown
  "#e377c2", // Pink
  "#7f7f7f", // Gray
  "#bcbd22", // Yellow-Green
  "#17becf", // Cyan
  "#aec7e8", // Light Blue
  "#ffbb78", // Light Orange
  "#98df8a", // Light Green
  "#ff9896", // Light Red
  "#c5b0d5", // Light Purple
  "#c49c94", // Tan
  "#f7b6d2", // Light Pink
  "#c7c7c7", // Light Gray
  "#dbdb8d", // Light Yellow-Green
  "#9edae5", // Light Cyan
];

function getLoadingsForPlot(
  feature_num: number,
  loadings: number[][],
  loadingScaleFactor: number,
  features: string[]
) {
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

interface PCAAnalysisProps {
  patientsData: Patient[];
  numFeatures: string[];
}

function PCA_analysis({
  patientsData: patientsData,
  numFeatures: numFeatures,
}: PCAAnalysisProps) {
  console.log("PCA_analysis started");

  // Step 1: Track the indices of valid rows
  const validIndices: number[] = []; // Stores the original indices of valid rows

  const patients_data_num = patientsData
    .map((patient, index) => {
      const row = numFeatures.map((feature) => patient[feature]);
      if (row.includes(NaN)) {
        return null; // Mark as invalid
      }
      validIndices.push(index); // Keep track of valid rows
      return row;
    })
    .filter((row) => row !== null); // Remove invalid rows

  // Step 2: Perform PCA on valid numerical data
  const pca = new PCA(patients_data_num, { scale: true, center: true });
  const pcaProjections_object = pca.predict(patients_data_num);
  const pcaProjections: number[][] = pcaProjections_object.to2DArray(); // Use appropriate method to get data
  // const pcaProjections: number[][] = pcaProjections_object["data"];

  // Step 3: Map PCA projections back to the correct patients
  validIndices.forEach((originalIndex, i) => {
    const patient = patientsData[originalIndex]; // Retrieve the original patient
    patient.pc1 = pcaProjections[i][0];
    patient.pc2 = pcaProjections[i][1];
    patient.valid_pc = true;
  });

  // Step 4: For patients with NaN values, set PC to NaN
  patientsData.forEach((Patient, index) => {
    if (!validIndices.includes(index)) {
      Patient.pc1 = NaN;
      Patient.pc2 = NaN;
      Patient.valid_pc = false;
    }
  });

  // const loadings = pca.getLoadings().data;
  const loadings = pca.getLoadings().to2DArray(); // Use appropriate method to get data

  return loadings;
}

interface PCAPlotProps {
  patientsData: Patient[];
  numFeatures: string[];
  loadings: number[][];
  biplotFeatures: string[];
  showKmeans: boolean;
}
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

    const pcaProjections: number[][] = patientsDataValid.map((patient) => [
      patient.pc1,
      patient.pc2,
    ]);

    const validClusters: number[] = patientsDataValid.map(
      (patient) => patient.k_mean_cluster
    );

    const [min_x, , min_y] = CalcMinMaxMatrix({
      matrix: pcaProjections,
      feature_1: 0,
      feature_2: 1,
    });

    const loadingScaleFactor = 2.2;
    // const loadingMarks = [];

    const loadingLines: Plot.Mark[] = [];
    const loadingTexts: Plot.Mark[] = [];

    let show_features = biplotFeatures.map((x) => numFeatures.indexOf(x));
    // console.log("show_features", show_features);

    for (let i = 0; i < show_features.length; i++) {
      let j = show_features[i];
      const loadingMark = getLoadingsForPlot(
        j,
        loadings,
        loadingScaleFactor,
        numFeatures
      );
      loadingLines.push(loadingMark.line);
      loadingTexts.push(loadingMark.text);
      // loadingMarks.push(loadingMark.line, loadingMark.text);
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
                    : patientsDataValid[i][feature])
              )
              .join("\n"), // Show all biplot feature values
          ...(showKmeans
            ? {
                stroke: (_, i) => CLUSTERCOLORS[validClusters[i] % CLUSTERCOLORS.length], // Cluster colors
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

export { PCA_analysis, PlotPcaBiplot };
