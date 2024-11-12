import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";
import { categorial_keys_list } from "./categorical_keys_list";
import { numerical_keys_list } from "./numerical_keys_list";
import PCA_analysis from "./PCA"
import { PlotAgeHisto, PlotCorHeatmap, PlotScatterplot } from "./Heatmap_Scatterplots";

interface logPSXProps {
    message: string;
    logElement: any;
}
function LogPSX( {message, logElement}: logPSXProps ) {
    console.log(message, logElement);
    return <></>;
}

function App() {
    const z_score_features: string[] = [
        "attent_z_comp",
        "exec_z_comp",
        "visuosp_z_comp",
        "memory_z_comp",
        "language_z_comp",
        "npsid_rep_moca_c",
        "npsid_rep_mmse_c",
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on",
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
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on"


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

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);

    let emptyPatient: Patient = new Patient();
    const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54
    console.log("patients Data before useEffect", patients_data);

    useEffect(() => {

        console.log("Loading data...");
        async function load() {
            let loaded = (
                await d3.csv("dataset/PD_SampleData_Curated.csv")
            ).map((r) => Patient.fromJson(r));
            setData(loaded);
        }
        load();
        console.log("Data loaded!")
        setDataLoaded(true);
    }, []);

    // useEffect(() => {
    //     (async () => {
    //         console.log("Loading data...");

    //         const loaded = (
    //             await d3.csv("dataset/PD_SampleData_Curated.csv")
    //         ).map((r) => Patient.fromJson(r));
    //         setData(loaded);

    //         console.log("Data loaded!")
    //     })();
    // }, []);


    // let loaded_2 = await d3.csv("dataset/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
    // setData(loaded_2);

    console.log("patients Data before JSX", patients_data);

    useEffect(() => {
        console.log("patients Data after update", patients_data); // Logs every time patients_data updates
    }, [patients_data]);

    console.log("Data loaded?", dataLoaded);

    return (
        <>
            {dataLoaded ? (
                <>
                <p>data loaded</p><div>
                    <LogPSX message=" Data loaded finished fragment, Data loaded?" logElement={dataLoaded} />
                        
                        <a href="https://vitejs.dev" target="_blank">
                            <img src={viteLogo} className="logo" alt="Vite logo" />
                        </a>
                        <a href="https://react.dev" target="_blank">
                            <img
                                src={reactLogo}
                                className="logo react"
                                alt="React logo" />
                        </a>
                    </div><h1>Parkinson's disease analysis</h1><PlotAgeHisto patients_data={patients_data} selected_feature="" /><label htmlFor="feature">Choose a feature: </label><select
                        name="feature"
                        id="feature"
                        onChange={(e) => setFeature(e.target.value)}
                    >
                            {z_score_features.map((f) => (
                                <option value={f}>{f}</option>
                            ))}
                        </select><label htmlFor="categ_feature">
                            {" "}
                            --- Choose a categorical feature:{" "}
                        </label><select
                            name="categ_feature"
                            id="categ_feature"
                            onChange={(e) => setCategFeature(e.target.value)}
                        >
                            {categorial_keys_list.map((f) => (
                                <option value={f}>{f}</option>
                            ))}
                        </select><br /><button
                            onClick={() => {
                                setShowCatAvg(!showCatAvg);
                                setShowCatLinReg(false);
                            } }
                        >
                            Show Average for categories
                        </button><br /><button
                            onClick={() => {
                                setShowCatLinReg(!showCatLinReg);
                                setShowCatAvg(false);
                            } }
                        >
                            Show Linear Regression for categories
                        </button><div className="flex-container">
                            <PlotScatterplot
                                y_feature={feature}
                                x_feature="insnpsi_age"
                                patients_data={patients_data}
                                categorical_feature={categ_feature}
                                show_dash={true}
                                showCatLinReg={showCatLinReg}
                                showCatAvg={showCatAvg} />
                            <PlotScatterplot
                                y_feature={feature}
                                x_feature="npsid_ddur_v"
                                patients_data={patients_data}
                                categorical_feature={categ_feature}
                                show_dash={true}
                                showCatLinReg={showCatLinReg}
                                showCatAvg={showCatAvg} />
                        </div><div className="flex-container">
                            <PlotScatterplot
                                y_feature={z_failed_tests[feature]}
                                x_feature="insnpsi_age"
                                patients_data={patients_data}
                                categorical_feature={categ_feature}
                                showCatLinReg={showCatLinReg}
                                showCatAvg={showCatAvg} />
                            <PlotScatterplot
                                y_feature={z_failed_tests[feature]}
                                x_feature="npsid_ddur_v"
                                patients_data={patients_data}
                                categorical_feature={categ_feature}
                                showCatLinReg={showCatLinReg}
                                showCatAvg={showCatAvg} />
                        </div>
                        <h2>Select Features for the Correlation Heatmap:</h2><div className="checkbox-container">
                            {covFeatures.map((feature) => (
                                <div key={feature}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={selectedCovFeatures.includes(feature)}
                                            onChange={() => handleCheckboxChange(feature)} />
                                        {feature}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div>
                            <PlotCorHeatmap
                                patients_data={patients_data}
                                cov_features={selectedCovFeatures} />
                        </div>
                        <div className="flex-container" >
                            {/* {console.log("patients_data Fun", patients_data)} */}
                            <LogPSX message="patients_data PSX" logElement={patients_data} />
                            <LogPSX message="Start PCA" logElement={""}/>
                            {/* <PCA_analysis patients_data={patients_data} num_features={numerical_keys_list}/> */}
                        </div>
                    </>
            )
        :
        (
            <>
            <p>loading data...</p>
            <LogPSX message="loading data not finsihed fragment, data loaded?" logElement={dataLoaded} />
            </>
            // Logpsx("patients_data", patients_data)
        )}
        </>
    );
}

export default App;
