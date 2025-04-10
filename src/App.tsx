import { useEffect, useState, useRef } from "react";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import "bootstrap/dist/css/bootstrap.min.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";

import "./App.css";
import "./dropdown.css";
import * as d3 from "d3";
// import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";
// import { categorial_keys_list } from "./categorical_keys_list";
import { numerical_keys_list } from "./numerical_keys_list";
import { zTestMethodsMapping } from "./zTestMethodsMapping";
import { PCA_analysis, PlotPcaBiplot } from "./PCA";
// import { handleChatSubmit, handleChatSubmitSuggest } from "./ChatGPT";
import { handleChatSubmitSuggest } from "./ChatGPT";
import { handleChatSubmit } from "./ChatGPT";
import { MessageHistory } from "./ChatGPT";
import {
    PlotHisto,
    PlotCorHeatmap,
    PlotScatterplot,
    pearsonCorrelation,
} from "./Heatmap_Scatterplots";
import dataFieldDescription from "./PD_DataFieldsDescription_plain.txt?raw";
import ReactMarkdown from "react-markdown";
import { RunKmeans } from "./Kmean";
import systemsSpecificifications from "./systems_specification.json";

import * as Plot from "@observablehq/plot";

interface logPSXProps {
    message: string;
    logElement: any;
}

function LogPSX({ message, logElement }: logPSXProps) {
    console.log(message, logElement);
    return <></>;
}

// Define props type for the dropdown component
interface MultiSelectDropdownProps {
    options: string[];
    selectedOptions: string[];
    setSelectedOptions: React.Dispatch<React.SetStateAction<string[]>>;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedOptions,
    setSelectedOptions,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleCheckboxChange = (option: string) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(
                selectedOptions.filter((item) => item !== option)
            );
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };
    const max_length = 23;

    return (
        <div className="dropdown-container">
            <div
                className="dropdown-header"
                onClick={() => setDropdownOpen(!dropdownOpen)}
            >
                {selectedOptions.join(", ").length > max_length // Set max length here
                    ? `${selectedOptions.join(", ").slice(0, max_length)}..`
                    : selectedOptions.join(", ") || "Select features"}
                {/* <span className="dropdown-arrow">▼</span> */}
                <span className="dropdown-arrow"></span>
            </div>
            {dropdownOpen && (
                <div className="dropdown-options">
                    {options.map((option) => (
                        <div key={option} className="dropdown-option">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option)}
                                    onChange={() =>
                                        handleCheckboxChange(option)
                                    }
                                />
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

function App() {
    document.body.classList.add("bg-dark", "text-white");

    console.log("App started");

    // all features should be all the keys from the Patient class
    const allFeatures = Object.keys(new Patient());

    const covFeatures: string[] = [
        "insnpsi_age",
        "npsid_ddur_v",
        "ins_npsi_sex",
        "npsid_yearsed",
        "overall_domain_sum",
        "npsid_rep_moca_c",
        "npsid_rep_mmse_c",
        "attent_z_comp",
        "exec_z_comp",
        "visuosp_z_comp",
        "memory_z_comp",
        "language_z_comp",
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on",
        "rc_score_done",
        "sdmt_done",
        "flu_a_done",
        "phon_flu_done",
        "pc1",
        "pc2",
    ];

    const covFeatures_init: string[] = [
        "insnpsi_age",
        "npsid_ddur_v",
        "npsid_yearsed",
        "ins_npsi_sex",
        "overall_domain_sum",
        "npsid_rep_moca_c",
        "npsid_rep_mmse_c",
        "attent_z_comp",
        "exec_z_comp",
        "visuosp_z_comp",
        "memory_z_comp",
        "language_z_comp",
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on",
        "pc1",
        "pc2",
    ];

    const [selectedCovFeatures, setSelectedCovFeatures] =
        useState<string[]>(covFeatures_init);

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

    const [scatterplotFeatures, setScatterplotFeatures] = useState<
        [string, string]
    >(["insnpsi_age", "visuosp_z_comp"]);

    const [zTestMethods, setZTestMethods] = useState<string[]>(
        ["None", "k_mean_cluster", "z_diagnosis"].concat(
            zTestMethodsMapping[scatterplotFeatures[1]]
        )
    );

    const [zTestMethod, setZTestMethod] = useState<string>(zTestMethods[1]);

    function heatmapSetsScatterplotFeatures(features: [string, string]) {
        setScatterplotFeatures(features);

        let scatterplotCatFeatures: string[] = [
            "None",
            "k_mean_cluster",
            "z_diagnosis",
        ];
        // console.log("z Methods", Object.keys(zTestMethodsMapping));
        if (Object.keys(zTestMethodsMapping).includes(features[1])) {
            // scatterplotCatFeatures;
            scatterplotCatFeatures = scatterplotCatFeatures.concat(
                zTestMethodsMapping[features[1]]
            );

            setZTestMethods(scatterplotCatFeatures);
            setZTestMethod(scatterplotCatFeatures[1]);
        } else {
            setZTestMethods(["None", "k_mean_cluster", "z_diagnosis"]);
            setZTestMethod("k_mean_cluster");
        }
    }

    // features for PCA, biplot axis:
    const [biplotFeatures, setBiplotFeatures] = useState<string[]>([
        "npsid_ddur_v",
        // "insnpsi_age",
        "overall_domain_sum",
        // "visuosp_z_comp",
        // "exec_z_comp",
        "npsid_rep_mmse_c",
        "npsid_rep_moca_c",
        // "language_z_comp",
        // "attent_z_comp",
    ]);

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);

    // correlations of format {a: "feature1", b: "feature2", correlation: 0.8}
    const [pearsonCorr, setPearsonCorr] = useState<
        {
            a: string;
            b: string;
            correlation: number;
        }[]
    >([]);

    // todo, hard coded 54
    let emptyPatient: Patient = new Patient();
    const [patients_data, setPatientData] = useState<Patient[]>(
        Array(54).fill(emptyPatient)
    );
    function setPatientDataFunc(data: Patient[]) {
        console.log("Setting data...");
        setPatientData(data);
    }

    const [pcaLoadings, setPcaLoadings] = useState<number[][]>([]); // Use state to store pcaLoadings

    // kmeans
    const k_init = 2;
    const [k, setK] = useState<number>(k_init);

    function calcCorrelations(covFeatures: string[], patientsData: Patient[]) {
        let correlations = d3.cross(covFeatures, covFeatures).map(([a, b]) => ({
            a,
            b,
            correlation: pearsonCorrelation(
                Plot.valueof(patientsData, a) ?? [],
                Plot.valueof(patientsData, b) ?? []
            ),
        }));
        return correlations;
    }

    useEffect(() => {
        console.log("Loading data...");
        async function loadAndProcessData() {
            try {
                // Step 1: Load Data
                const patientDataLoaded = (
                    await d3.csv("dataset/PD_SampleData_Curated.csv")
                ).map((r) => Patient.fromJson(r));
                console.log("Data loaded!", patientDataLoaded);

                // Step 2: Run PCA Analysis
                const newPcaLoadings = PCA_analysis({
                    patientsData: patientDataLoaded,
                    numFeatures: numerical_keys_list,
                });

                // Run Kmeans
                RunKmeans(patientDataLoaded, setPatientDataFunc, k);

                // Step 3: Update State
                setPatientData(patientDataLoaded);
                setPcaLoadings(newPcaLoadings);
                setDataLoaded(true); // Set this last to indicate both processes are done

                const correlations = calcCorrelations(
                    covFeatures_init,
                    patientDataLoaded
                );
                setPearsonCorr(correlations);
                setMessageHisto([
                    ...messageHisto,
                    {
                        role: "system",
                        content:
                            "Pearson correlations from some features in format {a: 'feature1', b: 'feature2', correlation: 'number'}" +
                            JSON.stringify(correlations),
                    },
                ]);
            } catch (error) {
                console.error("Error loading data or running PCA:", error);
            }
        }
        loadAndProcessData();
    }, []);

    // ------------------------- chatGPT -------------------------
    // use ref to avoid re-rendering for the input field for every key stroke
    const promptRef = useRef<HTMLInputElement>(null);
    const [response, setResponse] = useState<string>("");
    const [messageHisto, setMessageHisto] = useState<MessageHistory[]>([
        {
            role: "system",
            content:
                "You are a helpful AI assistant, which helps user to understand a visual analytics dashboard." +
                "This are the specifications of the Dashboard: " +
                JSON.stringify(systemsSpecificifications),
        },
        {
            role: "system",
            content:
                " Please answer all questions in a short and concise manner.",
        },
        {
            role: "system",
            content: "Description of the features:" + dataFieldDescription,
        },
    ]);
    const [gptFeatureSuggestion, setGptFeatureSuggestion] = useState<
        [string, string]
    >(["", ""]);

    function handleGPTFeatureSuggestion(featureList: string[]) {
        // console.log("Features, ", featureList);

        // check if the features are valid in in the data
        if (featureList.every((feature) => allFeatures.includes(feature))) {
            console.log("Valid feature suggestion: ", featureList);
            setScatterplotFeatures([featureList[0], featureList[1]]);
            setGptFeatureSuggestion([featureList[0], featureList[1]]);
            return;
        } else {
            console.log("Invalid feature suggestion: ", featureList);
            // setMessageHisto([
            //     ...messageHisto,
            //     {
            //         role: "system",
            //         content:
            //             "Invalid features, please try again with valid features",
            //     },
            // ]);
        }

        return;
    }

    // handle offcanvas
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // ------------------------- JSX -------------------------
    return (
        <>
            {dataLoaded ? (
                <>
                    <div className="background-container">
                        <h1 className="heading">
                            Parkinson's disease analysis
                        </h1>
                        <div className="heatmap-scatterplots-grid">
                            <div className="flex-container-column ">
                                <div className="flex-container-row">
                                    <Button
                                        variant="dark"
                                        onClick={handleShow}
                                        className="show-chatgpt-button"
                                    >
                                        Show Chat assistant.
                                    </Button>
                                    <h3 className="pearsonCorrelation-heading">
                                        Pearson Correlation for selected
                                        features
                                    </h3>
                                </div>
                                {/* Offcanvas start */}

                                <Offcanvas
                                    show={show}
                                    onHide={handleClose}
                                    scroll={true}
                                    backdrop={false}
                                    placement="start"
                                    className="dark-offcanvas"
                                >
                                    <Offcanvas.Header closeButton>
                                        <Offcanvas.Title>
                                            ChatGPT
                                        </Offcanvas.Title>
                                    </Offcanvas.Header>
                                    <Offcanvas.Body>
                                        <div className="chatGPT-suggest-button">
                                            <button
                                                onClick={() =>
                                                    handleChatSubmitSuggest({
                                                        prompt:
                                                            promptRef.current
                                                                ?.value || "",
                                                        messageHisto:
                                                            messageHisto,
                                                        setMessageHisto:
                                                            setMessageHisto,
                                                        setResponse:
                                                            setResponse,
                                                        handleGPTFeatureSuggestions:
                                                            handleGPTFeatureSuggestion,
                                                    })
                                                }
                                            >
                                                Suggest Features
                                            </button>
                                        </div>
                                        <div>
                                            <p>Or ask your questions.</p>
                                            <div className="chatGPT-prompt">
                                                <input
                                                    type="text"
                                                    ref={promptRef}
                                                    placeholder="Enter your prompt here"
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleChatSubmit({
                                                            prompt:
                                                                promptRef
                                                                    .current
                                                                    ?.value ||
                                                                "",
                                                            messageHisto:
                                                                messageHisto,
                                                            setMessageHisto:
                                                                setMessageHisto,
                                                            setResponse:
                                                                setResponse,
                                                            handleGPTFeatureSuggestions:
                                                                handleGPTFeatureSuggestion,
                                                        })
                                                    }
                                                >
                                                    Submit
                                                </button>
                                            </div>

                                            <div className="chatgpt-response">
                                                <ReactMarkdown>
                                                    {response}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </Offcanvas.Body>
                                </Offcanvas>
                                {/* Offcanvas end */}

                                <div className="checkbox-container">
                                    {covFeatures.map((feature) => (
                                        <div key={feature}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCovFeatures.includes(
                                                        feature
                                                    )}
                                                    onChange={() =>
                                                        handleCheckboxChange(
                                                            feature
                                                        )
                                                    }
                                                />
                                                {feature}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <PlotCorHeatmap
                                        patients_data={patients_data}
                                        cov_features={selectedCovFeatures}
                                        selectedFeatures={scatterplotFeatures}
                                        gptFeatureSuggestion={
                                            gptFeatureSuggestion
                                        }
                                        setSelectedFeatures={
                                            heatmapSetsScatterplotFeatures
                                        }
                                        setCorrelations={setPearsonCorr}
                                    />
                                </div>
                            </div>

                            <div className="flex-container-column ">
                                {scatterplotFeatures[0] !== "" &&
                                scatterplotFeatures[1] !== "" ? (
                                    <div>
                                        <div className="pca-heading-container">
                                            {scatterplotFeatures[0] ==
                                            scatterplotFeatures[1] ? (
                                                <h4 className="plot-headings">
                                                    {scatterplotFeatures[1]}
                                                </h4>
                                            ) : (
                                                <h4 className="plot-headings">
                                                    {scatterplotFeatures[1]} vs{" "}
                                                    {scatterplotFeatures[0]}
                                                </h4>
                                            )}
                                            <select
                                                name="zTestCatFeature"
                                                style={{
                                                    visibility:
                                                        zTestMethods.length > 0
                                                            ? "visible"
                                                            : "hidden",
                                                }} // Use style attribute to set visibility
                                                id="zTestCatFeature"
                                                className="single-select-dropdown"
                                                value={zTestMethod}
                                                onChange={(e) =>
                                                    setZTestMethod(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {zTestMethods.map((f) => (
                                                    <option value={f}>
                                                        {f}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {scatterplotFeatures[0] ==
                                        scatterplotFeatures[1] ? (
                                            <PlotHisto
                                                patients_data={patients_data}
                                                selected_feature={
                                                    scatterplotFeatures[0]
                                                }
                                                k_mean_clusters={k}
                                                catFeature={zTestMethod}
                                            />
                                        ) : (
                                            <PlotScatterplot
                                                x_feature={
                                                    scatterplotFeatures[0]
                                                }
                                                y_feature={
                                                    scatterplotFeatures[1]
                                                }
                                                patients_data={patients_data}
                                                categorical_feature={
                                                    zTestMethod
                                                }
                                                k_mean_clusters={k}
                                                showCatLinReg={false}
                                                showCatAvg={true}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <p> No features Selected for Scatterplot</p>
                                )}
                                <div>
                                    <div className="pca-heading-container">
                                        <h4 className="plot-headings">
                                            PCA Analysis
                                        </h4>
                                        <div>
                                            <MultiSelectDropdown
                                                options={numerical_keys_list}
                                                selectedOptions={biplotFeatures}
                                                setSelectedOptions={
                                                    setBiplotFeatures
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="kmeans-container">
                                        <label htmlFor="kmeans-input">
                                            Number of Clusters (k):{" "}
                                        </label>
                                        <input
                                            type="number"
                                            id="kmeans-input"
                                            value={k}
                                            onChange={(e) =>
                                                setK(Number(e.target.value))
                                            }
                                            min="1"
                                            max="20"
                                        />
                                        <Button
                                            variant="dark"
                                            onClick={() =>
                                                RunKmeans(
                                                    patients_data,
                                                    setPatientDataFunc,
                                                    k
                                                )
                                            }
                                            className="run-kmeans-button"
                                        >
                                            Run
                                        </Button>
                                    </div>

                                    <PlotPcaBiplot
                                        patientsData={patients_data}
                                        numFeatures={numerical_keys_list}
                                        loadings={pcaLoadings}
                                        biplotFeatures={biplotFeatures}
                                        showKmeans={!(k === 1)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <p>loading data...</p>
                    <LogPSX
                        message="Loading data not finsished"
                        logElement={dataLoaded}
                    />
                </>
            )}
        </>
    );
}

export default App;
