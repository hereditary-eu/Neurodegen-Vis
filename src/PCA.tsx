import { Patient } from "./Patient";
import { PCA } from "ml-pca";
import * as Plot from "@observablehq/plot";
import { useEffect, useState, useRef } from "react";
import { CalcMinMaxMatrix } from "./HelperFunctions";

const FONTSIZE = "14px";

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
            fill: "red",
        }),
    };
}

interface PCAProps {
    patientsData: Patient[];
    numFeatures: string[];
    loadings: number[][];
    biplotFeatures: string[];
    showKmeans: boolean;
}

//  todo, split into pca plotting and pca calculation

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
        patient.principal_component_1 = pcaProjections[i][0];
        patient.principal_component_2 = pcaProjections[i][1];
        patient.valid_pc = true;
    });

    // Step 4: For patients with NaN values, set PC to NaN
    patientsData.forEach((Patient, index) => {
        if (!validIndices.includes(index)) {
            Patient.principal_component_1 = NaN;
            Patient.principal_component_2 = NaN;
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

        const pcaProjections: number[][] = patientsData
            .filter((patient) => patient.valid_pc)
            .map((patient) => [
                patient.principal_component_1,
                patient.principal_component_2,
            ]);

        const validClusters: number[] = patientsData
            .filter((patient) => patient.valid_pc)
            .map((patient) => patient.k_mean_cluster);
        console.log("validClusters", validClusters);
        console.log("test");

        const [min_x, max_x, min_y, max_y] = CalcMinMaxMatrix({
            matrix: pcaProjections,
            feature_1: 0,
            feature_2: 1,
        });

        const diff_x = max_x - min_x;
        const diff_y = max_y - min_y;

        // console.log("loadings", loadings);

        const biplotAxis = 0;
        const loadingScaleFactor = 2.2;
        const scaleFactor = (diff_x ** 2 + diff_y ** 2) ** (1 / 2);
        const scaleFactor2 =
            (1 /
                (loadings[biplotAxis][0] ** 2 + loadings[biplotAxis][1] ** 2) **
                    (1 / 2)) *
            1.5;

        const loadingMarks = [];

        // const show_features = [0, 1, 2, 3, 4, 6];
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
            loadingMarks.push(loadingMark.line, loadingMark.text);
        }

        const pca_scatterplot = Plot.plot({
            marginBottom: 40,
            marks: [
                Plot.dot(pcaProjections, {
                    x: (d) => d[0],
                    y: (d) => d[1],
                    tip: true,
                    ...(showKmeans
                        ? {
                              fill: (d, i) => {
                                  // todo, set specific colors for each cluster
                                  return validClusters[i];
                              },
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
