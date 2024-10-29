import { Patient } from "./Patient";
import {PCA} from "ml-pca";
import * as Plot from "@observablehq/plot";
import { useEffect, useState, useRef } from "react";

// import { SummaryTable } from "@observablehq/summary-table"


interface PCAProps {
    patients_data: Patient[];
    num_features: string[];
}

function PCA_analysis( {patients_data, num_features}: PCAProps ) { 

    console.log("patients_data PCA", patients_data);
    const patients_data_num = patients_data
        .map((patient) => {
            const row = num_features.map((feature) => patient[feature]);
            return row.includes(NaN) ? null : row;
        })
        .filter((row) => row !== null);
    console.log("patients_data_num", patients_data_num);
    
    // Create a new PCA instance and fit the data
    const pca = new PCA(patients_data_num, {scale: true, center: true});
    // const pca = new PCA(patients_data_num);

    console.log("pca", pca);
    
    // Get the principal components
    const principalComponents = pca.getEigenvectors();
    console.log("principalComponents", principalComponents);

    console.log("predict", pca.predict(patients_data_num));
    console.log("standard deviation", pca.getStandardDeviations());

    console.log("explained variance", pca.getExplainedVariance());

    let predictedData_2 = pca.predict(patients_data_num)
    console.log("predictedData_2", predictedData_2);

    // Get the projected data on the first two principal components
    // const projectedData = pca.predict(patients_data_num).map((row) => [row[0], row[1]]);
    // console.log("projectedData", projectedData);

    // Create a scatterplot using observablehq/plot
    const pca_scatterplot = Plot.plot({
        marks: [
            Plot.dot(predictedData_2, {x: d => d[0], y: d => d[1]})
        ],
        x: {
            label: "Principal Component 1"
        },
        y: {
            label: "Principal Component 2"
        }
    });

    const pca_scatterplot_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element
    if (pca_scatterplot_ref.current) {
        pca_scatterplot_ref.current.innerHTML = ""; // Clear the div
        pca_scatterplot_ref.current.appendChild(pca_scatterplot);
    }

    

    return (
        <div>
        <h2>PCA Analysis</h2>
        <div ref={pca_scatterplot_ref} />
        </div>
    );   
}
;

export default PCA_analysis;