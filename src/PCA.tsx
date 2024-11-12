import { Patient } from "./Patient";
import {PCA} from "ml-pca";
import * as Plot from "@observablehq/plot";
import { useEffect, useState, useRef } from "react";
import { CalcMinMaxMatrix } from "./HelperFunctions";

function getLoadingsForPlot(feature_num: number, loadings: number[][], loadingScaleFactor: number, features: string[]) {
    const loadingsForPlot = [{x: 0, y: 0}, 
        {
            x: loadings[feature_num][0] * loadingScaleFactor, 
            y: loadings[feature_num][1] * loadingScaleFactor,
            feature: features[feature_num],
        }] 

    return {
            line: Plot.line(loadingsForPlot, {
                x: "x",
                y: "y",
                stroke: "red",
                strokeWidth: 2,
                markerEnd: 'arrow', // Arrow tip to indicate direction
            }),

            text: Plot.text([loadingsForPlot[1]], {
                x: "x",
                y: "y",
                text: 'feature',
                // dx: 10,
                dy: -(10)  * Math.sign(loadingsForPlot[1].y),
                fontSize: 13,
                fill: "red",
            })
    }
}

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

    const [min_x, max_x, min_y, max_y] = CalcMinMaxMatrix({
        matrix: predictedData,
        feature_1: 0,
        feature_2: 1,
    });

    const diff_x = max_x - min_x;	
    const diff_y = max_y - min_y;

    const loadings = pca.getLoadings().data;
    
    // let a = loadings.get(0, 0);
    
    console.log("loadings", loadings);

    const biplotAxis = 0;
    const loadingScaleFactor = 2.2;
    const scaleFactor = (diff_x**2 + diff_y**2)**(1/2) ;
    const scaleFactor2 = 1/((loadings[biplotAxis][0]**2 + loadings[biplotAxis][1]**2)**(1/2)) * 1.5;

    const loadingMarks = [];

    const show_features = [0, 1, 2, 3, 4, 6];
    
    for (let i = 0; i < show_features.length; i++) {
        let j = show_features[i];
        const loadingMark = getLoadingsForPlot(j, loadings, loadingScaleFactor, num_features);
        loadingMarks.push(loadingMark.line, loadingMark.text);
    ;
    }

    const pca_scatterplot = Plot.plot({
        marks: [
            Plot.dot(predictedData, {x: d => d[0], y: d => d[1], tip: true}),
            Plot.ruleY([min_y]),
            Plot.ruleX([min_x]),
            Plot.ruleY([0]),
            Plot.ruleX([0]),
            ...loadingMarks,
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