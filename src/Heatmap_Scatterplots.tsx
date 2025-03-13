import { useEffect, useRef } from "react";
import "./App.css";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";
import { CalcMinMaxPatientsData } from "./HelperFunctions";

interface CorHeatmapProps {
    patients_data: Patient[];
    cov_features: string[];
    setSelectedFeatures: (selectedFeatures: [string, string]) => void;
    setCorrelations: (
        correlations: { a: string; b: string; correlation: number }[]
    ) => void;
}

const FONTSIZE = "14px";
const COLORS: { [key: number]: string } = {
    0: "orange",
    1: "green",
};
const COLORS_HISTO: { [key: string]: string } = {
    Done: "orange",
    "Not Done": "green",
};

// // todo, set cluster to color, not just with order
const CLUSTERCOLORS: { [key: number]: string } = {
    [-1]: "#ffffff", // white => cluster -1
    0: "#1f77b4", // Blue
    1: "#ff7f0e", // Orange
    2: "#2ca02c", // Green
    3: "#9467bd", // Purple
    4: "#8c564b", // Brown
    5: "#e377c2", // Pink
    6: "#7f7f7f", // Gray
    7: "#bcbd22", // Yellow-Green
    8: "#17becf", // Cyan
    9: "#aec7e8", // Light Blue
    10: "#ffbb78", // Light Orange
    11: "#98df8a", // Light Green
    12: "#ff9896", // Light Red
    13: "#c5b0d5", // Light Purple
    14: "#c49c94", // Tan
    15: "#f7b6d2", // Light Pink
    16: "#c7c7c7", // Light Gray
    17: "#dbdb8d", // Light Yellow-Green
    18: "#9edae5", // Light Cyan
    19: "#dadaeb", // Light Light Blue
};

// correlations of the form {a: string, b: string, correlation: number from all combinations of cov_features}
// correlations: {'string', 'string', 'number'}[]

// Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap
function PlotCorHeatmap({
    patients_data,
    cov_features,
    setSelectedFeatures,
    setCorrelations,
}: CorHeatmapProps) {
    const corr_heatmap_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element

    // only called in UseEffect to ommit unecessary calculations
    useEffect(() => {
        // d3.cross returns the cartesian product (all possible combinations) of the two arrays
        console.log("PlotCorHeatmap fun started");
        let correlations = d3
            .cross(cov_features, cov_features)
            .map(([a, b]) => ({
                a,
                b,
                correlation: pearsonCorrelation(
                    Plot.valueof(patients_data, a) ?? [],
                    Plot.valueof(patients_data, b) ?? []
                ),
            }));
        // console.log("correlations", correlations);
        setCorrelations(correlations);

        const heatmap_width = cov_features.length * 65 + 165;
        const heatmap_height = cov_features.length * 35 + 155;

        const corr_heatmap = Plot.plot({
            width: heatmap_width, // Set the overall width of the heatmap
            height: heatmap_height, // Set the overall height of the heatmap (adjust for number of features)
            marginLeft: 134,
            marginBottom: 132,
            label: null,
            color: {
                scheme: "buylrd", // blue-red color scheme
                pivot: 0, // Zero as the midpoint
                legend: true, // Display a color legend
                label: "correlation", // Label for the legend
            },
            x: {
                // label: "Features (X)",
                domain: cov_features, // Order the x-axis according to cov_features
                tickRotate: 90, // Rotate the x-axis tick labels by 90 degrees
            },
            y: {
                // label: "Features (Y)",
                domain: cov_features, // Order the y-axis according to cov_features
            },
            marks: [
                Plot.cell(correlations, {
                    x: "a",
                    y: "b",
                    fill: "correlation",
                    className: "heatmap-cell",
                }),
                Plot.text(correlations, {
                    x: "a",
                    y: "b",
                    text: (d) => d.correlation.toFixed(2), // toFixed(2) to convert number to string and display only 2 decimal places
                    fill: (d) =>
                        d.correlation > 0.8 || d.correlation < -0.6
                            ? "white"
                            : "black",
                    fontSize: 12, //fontsize of correlation values
                    className: "heatmap-cell",
                }),
            ],
            style:
                "font-size: " + FONTSIZE + "; --plot-axis-tick-rotate: 90deg;",
        });

        // adapted from https://observablehq.com/@ambassadors/interactive-plot-dashboard
        const rects = d3.select(corr_heatmap).selectAll("rect");
        console.log("rects", rects);
        d3.select(corr_heatmap)
            // .selectAll("rect")
            .on("click", function (event) {
                let target = event.target; // cell
                if (target.parentElement.classList.contains("heatmap-cell")) {
                    // copy the children of the parent element to an array and get the index of the cell
                    let idx1d = [...target.parentElement.children].indexOf(
                        target
                    );
                    const idx_x = Math.floor(idx1d / cov_features.length);
                    const idx_y = idx1d % cov_features.length;

                    console.log("Clicked on cell", idx_x, idx_y);
                    setSelectedFeatures([
                        cov_features[idx_x],
                        cov_features[idx_y],
                    ]);
                }
            })
            .on("pointerover", function (event) {
                let target = event.target; // cell

                // check if target has class head-map-cell
                if (target.parentElement.classList.contains("heatmap-cell")) {
                    let idx1d = [...target.parentElement.children].indexOf(
                        target
                    );

                    d3.select(target).style("cursor", "pointer");
                    // highlight the according rectangle from rects
                    d3.select(rects.nodes()[idx1d])
                        .style("stroke", "black")
                        .style("stroke-width", 2);
                }
            })
            .on("pointerout", function (event) {
                let target = event.target; // Get the target of the pointer event

                // Ensure the target is part of a heatmap cell (either the rectangle or the text)
                if (target.parentElement.classList.contains("heatmap-cell")) {
                    let idx1d = [...target.parentElement.children].indexOf(
                        target
                    );

                    // Reset the stroke on the corresponding rect
                    d3.select(rects.nodes()[idx1d]).style("stroke", "none");
                }
            });
        // .style("cursor", "default");
        // .style("cursor", "pointer");

        // console.log("corr_heatmap_ref.current", corr_heatmap_ref.current);
        if (corr_heatmap_ref.current) {
            corr_heatmap_ref.current.innerHTML = ""; // Clear the div
            corr_heatmap_ref.current.appendChild(corr_heatmap);
        }
    }, [patients_data, cov_features]); //called every time an input changes

    return <div ref={corr_heatmap_ref}></div>;
}

interface ScatterplotProps {
    y_feature: string;
    x_feature: string;
    patients_data: Patient[];
    categorical_feature: string;
    k_mean_clusters: number;
    show_dash?: boolean;
    showCatLinReg?: boolean;
    showCatAvg?: boolean;
}

function PlotScatterplot({
    y_feature,
    x_feature,
    patients_data,
    categorical_feature,
    k_mean_clusters,
    show_dash = false,
    showCatAvg = false,
    showCatLinReg = false,
}: ScatterplotProps) {
    // only called in UseEffect
    function createPlot() {
        console.log("Scatterplot fun started");
        patients_data = patients_data.filter(
            (p) => !isNaN(p[x_feature] && p[y_feature])
        );

        let catFeatureSelected: boolean =
            categorical_feature !== "" && categorical_feature !== "None";
        console.log("catFeatureSelected", catFeatureSelected);

        let colors = COLORS;
        let k_mean_cluster_sel = false;
        if (categorical_feature === "k_mean_cluster") {
            if (k_mean_clusters === 1) {
                catFeatureSelected = false;
            } else {
                k_mean_cluster_sel = true;
                colors = CLUSTERCOLORS;
                showCatAvg = false;
                showCatLinReg = false;
            }
        }

        if (!catFeatureSelected) {
            showCatAvg = false;
            showCatLinReg = false;
        }

        let [min_x, max_x, min_y, max_y] = CalcMinMaxPatientsData({
            y_feature,
            x_feature,
            patients_data,
        });
        // console.log("--min max--");
        // console.log(min_x, max_x, min_y, max_y);

        // -- Linear Regression --
        // LinReg all
        let slope_all: number = 0;
        let intercept: number = 0;
        [slope_all, intercept] = LinReg(
            patients_data.map((p) => p[x_feature]),
            patients_data.map((p) => p[y_feature])
        );
        const linReg_x = [min_x, max_x];
        let linReg_y = linReg_x.map((x) => slope_all * x + intercept);
        const linRegDataAll = linReg_x.map((x, i) => ({
            x: x,
            y: linReg_y[i],
        }));

        // Lin Reg Category 0!
        // [slope, intercept] = calcAverage(
        // [slope, intercept] = linReg(
        let slope: number = 0;
        [slope, intercept] = CalcAverage(
            patients_data
                .filter((d) => d[categorical_feature] === 0) // also filters out NaN
                .map((p) => p[x_feature]),
            patients_data
                .filter((d) => d[categorical_feature] === 0)
                .map((p) => p[y_feature])
        );
        linReg_y = linReg_x.map((x) => slope * x + intercept);
        const linRegData0 = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

        // Lin Reg Category 1!
        // [slope, intercept] = calcAverage(
        // [slope, intercept] = linReg(

        if (showCatLinReg) {
            [slope, intercept] = LinReg(
                patients_data
                    .filter((d) => d[categorical_feature] === 1) // also filters out NaN
                    .map((p) => p[x_feature]),
                patients_data
                    .filter((d) => d[categorical_feature] === 1)
                    .map((p) => p[y_feature])
            );
        } else {
            [slope, intercept] = CalcAverage(
                patients_data
                    .filter((d) => d[categorical_feature] === 1) // also filters out NaN
                    .map((p) => p[x_feature]),
                patients_data
                    .filter((d) => d[categorical_feature] === 1)
                    .map((p) => p[y_feature])
            );
        }

        linReg_y = linReg_x.map((x) => slope * x + intercept);
        const linRegData1 = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

        const pd_scatterplot = Plot.plot({
            marginBottom: 35,
            marks: [
                Plot.dot(patients_data, {
                    x: x_feature,
                    y: y_feature,
                    tip: true,
                    ...(catFeatureSelected
                        ? {
                              stroke: (d) => colors[d[categorical_feature]],
                          }
                        : {}),
                }),
                Plot.line(linRegDataAll, {
                    x: "x",
                    y: "y",
                    stroke: "white",
                    strokeWidth: 1.8,
                }),
                // If a categorical feature is selected, color the dots by category
                ...(showCatLinReg || showCatAvg
                    ? [
                          Plot.line(linRegData0, {
                              x: "x",
                              y: "y",
                              stroke: colors[0],
                              strokeWidth: 3,
                          }),
                          Plot.line(linRegData1, {
                              x: "x",
                              y: "y",
                              stroke: colors[1],
                              strokeWidth: 2.5,
                          }),
                      ]
                    : []),
                Plot.crosshair(patients_data, {
                    x: x_feature,
                    y: y_feature,
                    tip: true,
                }),
                Plot.ruleY([min_y]),
                Plot.ruleX([min_x]),
                // Conditionally add the dashed line if show_dash is true
                ...(show_dash
                    ? [Plot.ruleY([-1], { strokeDasharray: "3" })]
                    : []),
            ],
            x: {
                label: x_feature,
                domain: [min_x, max_x],
            },
            y: {
                label: y_feature,
                domain: [min_y, max_y],
            },
            // color: {
            //     // set domian to [0, 1] if not k_mean_cluster
            //     // domain: catFeatureSelected ? [0, 1] : [],
            //     // domain: [0, 1],
            //     // ...(!k_mean_cluster_sel ? { domain: [0, 1] } : {}),
            //     // range: colors,
            // },
            style: "--plot-background: black; font-size: " + FONTSIZE, //13px",
        });
        return pd_scatterplot;
    }

    const scatterplot_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element

    // useeffect renders after the first render and after every update.
    // Important, because otherwise scatterplot_ref.current would be null, because it would not rendered yet
    useEffect(() => {
        // console.log("use effect in scatterplot");
        // console.log("scatterplot_ref.current", scatterplot_ref.current);
        if (scatterplot_ref.current) {
            scatterplot_ref.current.innerHTML = ""; // Clear the div
            scatterplot_ref.current.appendChild(createPlot());
        }
    }, [y_feature, x_feature, patients_data, categorical_feature]); //called every time an input changes

    return (
        <>
            {/* <h3 className="plot-headings">
                {y_feature} vs {x_feature}, slope=
                {Math.round(slope_all * 1000) / 1000}
            </h3> */}
            <div ref={scatterplot_ref}></div>
        </>
    );
}

interface plotHistoProps {
    patients_data: Patient[];
    selected_feature: string;
    catFeature: string;
    k_mean_clusters: number;
}

function PlotHisto({
    patients_data,
    selected_feature,
    catFeature,
    k_mean_clusters,
}: plotHistoProps) {
    function createPlot() {
        console.log("plotHisto fun started");
        const binNumber = 9;

        let catFeatureSelected: boolean =
            catFeature !== "" && catFeature !== "None";
        console.log("catFeatureSelected", catFeatureSelected);

        let colors = COLORS_HISTO;
        let k_mean_cluster_sel = false;
        if (catFeature === "k_mean_cluster") {
            if (k_mean_clusters === 1) {
                catFeatureSelected = false;
            } else {
                k_mean_cluster_sel = true;
                colors = CLUSTERCOLORS;
            }
        }

        // dont define as Patient[], because than the map function does not work
        let patients_data_map: { [key: string]: any }[] = patients_data;
        if (catFeatureSelected && !k_mean_cluster_sel) {
            patients_data_map = patients_data.map((p) => ({
                ...p,
                [catFeature]: p[catFeature] === 1 ? "Done" : "Not Done",
            }));
        }

        const histoPlot = Plot.plot({
            marginBottom: 35,
            marginTop: 25,
            marks: [
                Plot.rectY(
                    patients_data_map,
                    Plot.binX(
                        { y: "count", thresholds: binNumber },
                        {
                            x: selected_feature,
                            ...(catFeatureSelected
                                ? {
                                      fill: (d) => colors[d[catFeature]],
                                  }
                                : {}),
                        }
                    )
                ),
                Plot.ruleY([0]),
                // Plot.tip(
                //     patients_data_map,
                //     Plot.binX(
                //         { y: "count", thresholds: binNumber },
                //         {
                //             x: selected_feature,
                //             ...(catFeatureSelected ? { fill: catFeature } : {}),
                //         }
                //     )
                // ),
                // Plot.ruleX([0])
            ],
            x: {
                label: selected_feature,
                tickFormat: (d: number) => d.toString(),
            },
            y: {
                label: "Frequency",
                grid: true,
            },
            color: {
                // ...(catFeatureSelected ? { legend: true } : {}),
                // domain: ["Not Done", "Done"],
                legend: true,
                ...(!k_mean_cluster_sel && catFeatureSelected
                    ? { domain: ["Not Done", "Done"] }
                    : {}),
                range: Object.values(colors),
            },
            style: "--plot-background: black; font-size: " + FONTSIZE,
        });

        return histoPlot;
    }
    const histoRef = useRef<HTMLDivElement>(null); // Create a ref to access the div element

    // useeffect renders after the first render and after every update.
    // Important, because otherwise scatterplot_ref.current would be null, because it would not rendered yet
    useEffect(() => {
        if (histoRef.current) {
            histoRef.current.innerHTML = ""; // Clear the div
            histoRef.current.appendChild(createPlot());
        }
    }, [patients_data, selected_feature, catFeature]); //called every time an input changes

    return <div ref={histoRef}></div>;
}

function LinReg(xArray: number[], yArray: number[]): [number, number] {
    // Calculate Sums
    // console.log("linReg fun started");
    let xSum = 0,
        ySum = 0,
        xxSum = 0,
        xySum = 0;
    let count = xArray.length;

    // remove NaN values
    for (let i = 0; i < count; i++) {
        if (isNaN(xArray[i]) || isNaN(yArray[i])) {
            xArray.splice(i, 1);
            yArray.splice(i, 1);
            count--;
        }
    }

    for (let i = 0, len = count; i < count; i++) {
        xSum += xArray[i];
        ySum += yArray[i];
        xxSum += xArray[i] * xArray[i];
        xySum += xArray[i] * yArray[i];
    }
    let slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
    let intercept = ySum / count - (slope * xSum) / count;

    return [slope, intercept];
}

function CalcAverage(xArray: number[], yArray: number[]): [number, number] {
    const slope = 0;
    let intercept = 0;

    const sum = yArray.reduce((acc, val) => acc + val, 0);
    const avg = sum / yArray.length;
    intercept = avg;

    return [slope, intercept];
}

// Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap
function pearsonCorrelation(x: number[], y: number[]) {
    const n = x.length;
    if (y.length !== n)
        throw new Error("The two columns must have the same length.");

    // console.log("pearsonCorrelation fun started");
    // if array empty, d3 mean returns Nan, so we set it to 0
    const x_mean: number = d3.mean(x) ?? 0;
    const y_mean: number = d3.mean(y) ?? 0;

    const cov_xy = d3.sum(x, (_, i) => (x[i] - x_mean) * (y[i] - y_mean));
    const sigma_xx = d3.sum(x, (d) => (d - x_mean) ** 2);
    const sigma_yy = d3.sum(y, (d) => (d - y_mean) ** 2);
    return cov_xy / Math.sqrt(sigma_xx * sigma_yy);
}

export { PlotHisto, PlotScatterplot, PlotCorHeatmap, pearsonCorrelation };
