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
    
    // Get the principal components
    const principalComponents = pca.getEigenvectors();

    const predictedData_object= pca.predict(patients_data_num)
    const predictedData: number[] = predictedData_object["data"]
    console.log("predictedData_object", predictedData_object)  
    console.log("predictedData", predictedData);

    const pca_scatterplot = Plot.plot({
        marks: [
            Plot.dot(predictedData, {x: d => d[0], y: d => d[1], tip: true})
        ],
        x: {
            label: "Principal Component 1"
        },
        y: {
            label: "Principal Component 2"
        },
        style: "--plot-background: black; font-size: 11px",
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
};

export default PCA_analysis;