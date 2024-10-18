import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
import d3_mean from "d3-array/src/mean";
// import * as obsPlot from "observablehq/plot";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";
import { categorial_keys_list } from "./categorical_keys_list";

interface plotHistoProps {
    patients_data: Patient[];
    selected_feature: string;
}

function PlotAgeHisto({ patients_data, selected_feature }: plotHistoProps) {
    console.log("plotHisto fun started");
    let binNumber = 8;

    let total_age: number = 0;
    patients_data.forEach((p) => {
        total_age += p.insnpsi_age;
    });

    let patients_age: number[] = [];
    patients_data.forEach((p) => {
        patients_age.push(p.insnpsi_age);
    });

    let patients_attent_z_comp: number[] = [];
    patients_data.forEach((p) => {
        patients_attent_z_comp.push(p.attent_z_comp);
    });

    // ----------------------------- scatterplot -----------------------------
    // Obsverable plot
    // const rand_histo = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
    const dur_histo = Plot.plot({
        marks: [
            // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
            Plot.rectY(
                patients_data,
                Plot.binX(
                    { y: "count", thresholds: binNumber },
                    { x: "npsid_ddur_v" }
                )
            ),
            Plot.ruleY([0]),
            // Plot.ruleX([0])
        ],
        x: {
            label: "Age",
            tickFormat: (d: number) => d.toString(),
        },
        y: {
            label: "Frequency",
        },
    });
    const div_dur_histo = document.querySelector("#myplot");
    if (div_dur_histo) {
        div_dur_histo.innerHTML = ""; // Clear the div
        div_dur_histo.appendChild(dur_histo);
    } else {
        console.log("div not found");
    }

    const age_histo = Plot.plot({
        marks: [
            // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
            Plot.rectY(
                patients_data,
                Plot.binX(
                    { y: "count", thresholds: binNumber },
                    { x: "insnpsi_age" }
                )
            ),
            Plot.ruleY([0]),
            // Plot.ruleX([0])
        ],
        x: {
            label: "Age",
            tickFormat: (d: number) => d.toString(),
        },
        y: {
            label: "Frequency",
        },
        style: "--plot-background: black; font-size: 11px",
    });
    const age_histo_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element
    if (age_histo_ref.current) {
        age_histo_ref.current.innerHTML = ""; // Clear the div
        age_histo_ref.current.appendChild(age_histo);
        // histogramRef.current.appendChild(rand_histo);
    }

    console.log("obs plot created");
    return (
        <>
            <div className="flex-container">
                <div>
                    <p>Age Distribution</p>
                    <div ref={age_histo_ref}></div>
                </div>
                <div>
                    <p>Time since PD diagnosis Distribution</p>
                    <div id="myplot"></div>
                </div>
            </div>
        </>
    );
}

function linReg(xArray: number[], yArray: number[]): [number, number] {
    // Calculate Sums
    console.log("linReg fun started");
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

function calcAverage(xArray: number[], yArray: number[]): [number, number] {
    const slope = 0;
    let intercept = 0;

    // const sum =
    console.log(yArray);
    const sum = yArray.reduce((acc, val) => acc + val, 0);
    const avg = sum / yArray.length;
    intercept = avg;


    return [slope, intercept];
}

interface ScatterplotProps {
    y_feature: string;
    x_feature: string;
    patients_data: Patient[];
    categorical_feature: string;
    show_dash?: boolean;
    showCatLinReg?: boolean;
    showCatAvg?: boolean;
}

function calcMinMax({
    y_feature,
    x_feature,
    patients_data,
    categorical_feature = "",
    show_dash = false,
}: ScatterplotProps) {
    const min_x = Math.min(
        ...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d))
    );
    const max_x = Math.max(
        ...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d))
    );
    const min_y = Math.min(
        ...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d))
    );
    const max_y = Math.max(
        ...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d))
    );
    const x_range = max_x - min_x;
    const y_range = max_y - min_y;
    return [
        min_x - x_range * 0.05,
        max_x + x_range * 0.05,
        min_y - y_range * 0.05,
        max_y + y_range * 0.05,
    ];
}

function PlotScatterplot({
    y_feature,
    x_feature,
    patients_data,
    categorical_feature,
    show_dash = false,
    showCatAvg = false,
    showCatLinReg = false,
}: ScatterplotProps) {
    console.log("Scatterplot fun started");
    patients_data = patients_data.filter(
        (p) => !isNaN(p[x_feature] && p[y_feature])
    );

    let [min_x, max_x, min_y, max_y] = calcMinMax({
        y_feature,
        x_feature,
        patients_data,
        categorical_feature,
    });
    console.log("--min max--");

    // -- Linear Regression --
    // LinReg all
    let slope_all: number = 0;
    let intercept: number = 0;
    [slope_all, intercept] = linReg(
        patients_data.map((p) => p[x_feature]),
        patients_data.map((p) => p[y_feature])
    );
    const linReg_x = [min_x, max_x];
    let linReg_y = linReg_x.map((x) => slope_all * x + intercept);
    const linRegDataAll = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

    // Lin Reg Category 0!
    // [slope, intercept] = calcAverage(
    // [slope, intercept] = linReg(
    let slope: number = 0;
    [slope, intercept] = calcAverage(
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
        [slope, intercept] = linReg(
            patients_data
                .filter((d) => d[categorical_feature] === 1) // also filters out NaN
                .map((p) => p[x_feature]),
            patients_data
                .filter((d) => d[categorical_feature] === 1)
                .map((p) => p[y_feature])
        );
    } else {
        [slope, intercept] = calcAverage(
            patients_data
                .filter((d) => d[categorical_feature] === 1) // also filters out NaN
                .map((p) => p[x_feature]),
            patients_data
                .filter((d) => d[categorical_feature] === 1)
                .map((p) => p[y_feature])
        );
    }

    // [slope, intercept] = calcAverage(
    //     patients_data
    //         .filter((d) => d[categorical_feature] === 1) // also filters out NaN
    //         .map((p) => p[x_feature]),
    //     patients_data
    //         .filter((d) => d[categorical_feature] === 1)
    //         .map((p) => p[y_feature])
    // );
    linReg_y = linReg_x.map((x) => slope * x + intercept);
    const linRegData1 = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

    if (show_dash) {
        console.log("linRegData");
        console.log("linRegDataall:", linRegDataAll[0], linRegDataAll[1]);
        console.log("linRegData0:", linRegData0[0], linRegData0[1]);
        console.log("linRegData1:", linRegData1[0], linRegData1[1]);
        console.log(showCatLinReg);
    }

    let colors: string[] = ["orange", "green"];
    const pd_scatterplot = Plot.plot({
        marks: [
            Plot.dot(patients_data, {
                x: x_feature,
                y: y_feature,
                stroke: categorical_feature,
                tip: true,
            }),
            Plot.line(linRegDataAll, {
                x: "x",
                y: "y",
                stroke: "white",
                strokeWidth: 1.8,
            }),
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
            ...(show_dash ? [Plot.ruleY([-1], { strokeDasharray: "3" })] : []),
        ],
        x: {
            label: x_feature,
            domain: [min_x, max_x],
        },
        y: {
            label: y_feature,
            domain: [min_y, max_y],
        },
        color: {
            domain: [0, 1],
            range: colors,
        },
        style: "--plot-background: black; font-size: 11px",
        // style: {
        //     backgroundColor: "black",
        //     fontSize: "12px",
        // },
        // style: {fontSize: "15px"}
        // TODO change font size
    });

    const pd_duration_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element
    if (pd_duration_ref.current) {
        pd_duration_ref.current.innerHTML = ""; // Clear the div
        pd_duration_ref.current.appendChild(pd_scatterplot);
        // histogramRef.current.appendChild(rand_histo);
    }

    return (
        <>
            <div className="flex-container">
                <div>
                    <p>
                        {" "}
                        Scatterplot {y_feature}, slope=
                        {Math.round(slope_all * 1000) / 1000}
                    </p>
                    <div ref={pd_duration_ref}></div>
                </div>
            </div>
        </>
    );
}

// Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap
function pearsonCorrelation(x: number[], y: number[]) {
    const n = x.length;
    if (y.length !== n)
        throw new Error("The two columns must have the same length.");

    console.log("pearsonCorrelation fun started");
    // if array empty, d3 mean returns Nan, so we set it to 0
    const x_mean: number = d3.mean(x) ?? 0;
    // console.log("xmean:", x_mean);
    // let x_mean = mean(x);
    const y_mean: number = d3.mean(y) ?? 0;

    const cov_xy = d3.sum(x, (_, i) => (x[i] - x_mean) * (y[i] - y_mean));
    const sigma_xx = d3.sum(x, (d) => (d - x_mean) ** 2);
    const sigma_yy = d3.sum(y, (d) => (d - y_mean) ** 2);
    return cov_xy / Math.sqrt(sigma_xx * sigma_yy);
}

interface CorHeatmapProps {
    patients_data: Patient[];
    cov_features: string[];
}

// Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap
function Plot_cor_heatmap({ patients_data, cov_features }: CorHeatmapProps) {
    // let covmatrix_plot = "";

    // console.log("cov_features", cov_features);
    // d3.cross returns the cartesian product (all possible combinations) of the two arrays
    let correlations = d3.cross(cov_features, cov_features).map(([a, b]) => ({
        a,
        b,
        correlation: pearsonCorrelation(
            Plot.valueof(patients_data, a) ?? [],
            Plot.valueof(patients_data, b) ?? []
        ),
    }));
    // console.log("correlations", correlations);

    // const heatmap_width = cov_features.length * 65 + 130;
    const heatmap_width = cov_features.length * 65 + 165;
    console.log("heatmap_width", heatmap_width);
    // const heatmap_width = 700;
    const heatmap_height = cov_features.length * 35 + 155;
    console.log("heatmap_height", heatmap_height);

    const corr_heatmap = Plot.plot({
        width: heatmap_width, // Set the overall width of the heatmap
        height: heatmap_height, // Set the overall height of the heatmap (adjust for number of features)
        marginLeft: 130,
        marginBottom: 130,
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
            // tickSize: 20,
            // tickFontSize: 15,
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
                // inset: 0,
            }),
            Plot.text(correlations, {
                x: "a",
                y: "b",
                text: (d) => d.correlation.toFixed(2), // toFixed(2) to convert number to string and display only 2 decimal places
                fill: (d) =>
                    Math.abs(d.correlation) > 0.6 ? "white" : "black",
                fontSize: 11, //fontsize of correlation values
            }),
        ],
        style: "font-size: 12px;" + "--plot-axis-tick-rotate: 90deg;",
        // style: {
        //     fontSize: "12px", // Adjust font size globally (including axis labels)
        //     "--plot-axis-label-font-size": "14px", // Axis labels font size
        //     "--plot-axis-tick-font-size": "12px", // Tick labels font size
        //     "--plot-label-offset": "10px", // Adjust label offset (optional)
        //     "--plot-axis-tick-text-anchor": "start", // Align tick text
        //     "--plot-axis-tick-rotate": "90deg", // Rotate the x-axis tick labels by 90 degrees
        // }, // Type assertion to allow custom properties
    });

    const corr_heatmap_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element
    if (corr_heatmap_ref.current) {
        corr_heatmap_ref.current.innerHTML = ""; // Clear the div
        corr_heatmap_ref.current.appendChild(corr_heatmap);
        // histogramRef.current.appendChild(rand_histo);
    }

    return (
        <>
            <p>Covariance Matrix for selected Features.</p>
            <div className="flex-container">
                <div ref={corr_heatmap_ref}></div>
            </div>
        </>
    );
}

function SelectCorHeatmapFeatures(all_features: string[]) {
    return(
        <>  
            {/* Inputs.checkbox(["red", "green", "blue"], {label: "color"}) */}
        </>
    )
}

function App() {
    // const [count, setCount] = useState<number>(0);
    // console.log("TestLog")
    // console.log(categorial_keys_list)
    const z_score_features: string[] = [
        "attent_z_comp",
        "exec_z_comp",
        "visuosp_z_comp",
        "memory_z_comp",
        "language_z_comp",
        "npsid_rep_moca_c",
        "npsid_rep_mmse_c",
    ];

    interface stringMap {
        [key: string]: string;
    }
    const z_failed_tests: stringMap = {
        attent_z_comp: "attent_sum_z",
        exec_z_comp: "exec_sum_z",
        visuosp_z_comp: "visuosp_sum_z",
        memory_z_comp: "memory_sum_z",
        language_z_comp: "language_sum_z",
    };
    const z_failed_tests_tot: stringMap = {
        attent_z_comp: "attent_sum",
        exec_z_comp: "exec_sum",
        visuosp_z_comp: "visuosp_sum",
        memory_z_comp: "memory_sum",
        language_z_comp: "language_suz",
    };
    const [categ_feature, setCategFeature] = useState<string>(
        categorial_keys_list[0]
    );
    const [feature, setFeature] = useState<string>(z_score_features[0]);
    const feature_list: string[] = [
        "insnpsi_age",
        "attent_z_comp",
        "npsid_ddur_v",
        "attent_sum_z",
        "attent_sum",
    ];
    const covFeatures: string[] = [
        "insnpsi_age",
        "npsid_ddur_v",
        "overall_domain_sum",
        "npsid_rep_moca_c",
        "npsid_rep_mmse_c",
        "attent_z_comp",
        "exec_z_comp",
        "visuosp_z_comp",
        "memory_z_comp",
        "language_z_comp",
        "rc_score_done",
        "sdmt_done",
        "flu_a_done",
        "phon_flu_done",
    ];

    const [selectedCovFeatures, setSelectedCovFeatures] = useState<string[]>(
        covFeatures // Initially select all features
    );

    
    const handleCheckboxChange = (feature: string) => {
        setSelectedCovFeatures((prevSelected) => {
            if (prevSelected.includes(feature)) {
                // If feature is already selected, remove it
                return prevSelected.filter((f) => f !== feature);
            } else {
                // Otherwise, add the feature
                return [...prevSelected, feature];
            }
        });
    };



    // 32 overall_domain_sum ... sum of all failed tests. (z-scores below -11)
    // 9.	npsid_rep_moca_c: Raw result of Montreal Cognitive Assessment (MoCA) test (rep can be ignored, it is related to the fact that the variable is repeated in the data base).
    // 10.	npsid_rep_mmse_c: Raw result of Mini-Mental State Examination (MMSE) test.

    // categorical features:
    // 13. npsid_cog_stat : Cognitive status of the patient: 1=NoCognitiveImpairment; 2=MildCognitiveImpairment-single-domain; 3-MildCognitiveImpairment-multiple-domain; 4-Dementia

    // compare overall cognitve results, cognitve states, with this categorical ... done stuff.

    const [showCatAvg, setShowCatAvg] = useState<boolean>(false);
    const [showCatLinReg, setShowCatLinReg] = useState<boolean>(false);

    const [colorEnabled, setColorEnabled] = useState<boolean>(false); 

    let emptyPatient: Patient = new Patient();
    const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54
    useEffect(() => {
        async function load() {
            let loaded = (
                await d3.csv("dataset/PD_SampleData_Curated.csv")
            ).map((r) => Patient.fromJson(r));
            setData(loaded);
        }
        load();
    }, []);
    console.log("TestLog");
    // console.log(patients_data);

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Parkinson's disease analysis</h1>
            <PlotAgeHisto patients_data={patients_data} selected_feature="" />
            <label htmlFor="feature">Choose a feature: </label>
            <select
                name="feature"
                id="feature"
                onChange={(e) => setFeature(e.target.value)}
            >
                {z_score_features.map((f) => (
                    <option value={f}>{f}</option>
                ))}
            </select>
            <label htmlFor="categ_feature">
                {" "}
                --- Choose a categorical feature:{" "}
            </label>

            <select
                name="categ_feature"
                id="categ_feature"
                onChange={(e) => setCategFeature(e.target.value)}
            >
                {categorial_keys_list.map((f) => (
                    <option value={f}>{f}</option>
                ))}
            </select>
            <br />
            <button
                onClick={() => {
                    setShowCatAvg(!showCatAvg);
                    setShowCatLinReg(false);
                }}
            >
                Show Average for categories
            </button>
            <br />
            <button
                onClick={() => {
                    setShowCatLinReg(!showCatLinReg);
                    setShowCatAvg(false);
                }}
            >
                Show Linear Regression for categories
            </button>
            <div className="flex-container">
                <PlotScatterplot
                    y_feature={feature}
                    x_feature="insnpsi_age"
                    patients_data={patients_data}
                    categorical_feature={categ_feature}
                    show_dash={true}
                    showCatLinReg={showCatLinReg}
                    showCatAvg={showCatAvg}
                />
                <PlotScatterplot
                    y_feature={feature}
                    x_feature="npsid_ddur_v"
                    patients_data={patients_data}
                    categorical_feature={categ_feature}
                    show_dash={true}
                    showCatLinReg={showCatLinReg}
                    showCatAvg={showCatAvg}
                />
            </div>
            <div className="flex-container">
                <PlotScatterplot
                    y_feature={z_failed_tests[feature]}
                    x_feature="insnpsi_age"
                    patients_data={patients_data}
                    categorical_feature={categ_feature}
                    showCatLinReg={showCatLinReg}
                    showCatAvg={showCatAvg}
                />
                <PlotScatterplot
                    y_feature={z_failed_tests[feature]}
                    x_feature="npsid_ddur_v"
                    patients_data={patients_data}
                    categorical_feature={categ_feature}
                    showCatLinReg={showCatLinReg}
                    showCatAvg={showCatAvg}
                />
            </div>
            <h2>Select Features for the Correlation Heatmap:</h2>
            <div className="checkbox-container">
                {covFeatures.map((feature) => (
                    <div key={feature}>
                        <label >
                            <input
                                type="checkbox"
                                checked={selectedCovFeatures.includes(feature)}
                                onChange={() => handleCheckboxChange(feature)}
                            />
                            {feature}
                        </label>
                    </div>
                ))}
            </div>
            <div>
                <Plot_cor_heatmap
                    patients_data={patients_data}
                    cov_features={selectedCovFeatures}
                />
            </div>
        </>
    );
}

export default App;
