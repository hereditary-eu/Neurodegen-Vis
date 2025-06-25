import { useEffect, useState, useRef } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";

import "./css/App.css";
import "./css/dropdown.css";
import "./css/Chat-sidePanel.css";

import * as d3 from "d3";
import { Patient } from "./env_dataset/Patient";

import {
    pca_num_features_list,
    cat_features_mapping,
    cat_features_generic,
    cov_features,
    cov_features_init,
    scatterplot_features_init,
    biplot_features_init,
} from "./env_dataset/variables_feature_lists";

import { PCA_analysis, PlotPcaBiplot } from "./PCA";
import {
    handleChatSubmitSuggest,
    clearChatHistory,
    handleChatSubmit,
    MessageHistory,
    initialPrompt,
    ChatCodeRes,
} from "./Chat";
import {
    PlotHisto,
    PlotCorHeatmap,
    PlotScatterplot,
    pearsonCorrelation,
} from "./Heatmap_Scatterplots";
import ReactMarkdown from "react-markdown";
import { RunKmeans } from "./Kmean";

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

    const [selectedCovFeatures, setSelectedCovFeatures] =
        useState<string[]>(cov_features_init);

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
    >(scatterplot_features_init);

    const [catFeatures, setCatFeatures] = useState<string[]>(
        cat_features_generic.concat(
            cat_features_mapping[scatterplotFeatures[1]]
        )
    );

    // ToDO always resets to k_mean_cluster
    const [catFeature, setCatFeature] = useState<string>(catFeatures[1]);

    function heatmapSetsScatterplotFeatures(features: [string, string]) {
        setScatterplotFeatures(features);

        let scatterplotCatFeatures: string[] = cat_features_generic;

        // console.log("z Methods", Object.keys(zTestMethodsMapping));
        if (Object.keys(cat_features_mapping).includes(features[1])) {
            // scatterplotCatFeatures;
            scatterplotCatFeatures = scatterplotCatFeatures.concat(
                cat_features_mapping[features[1]]
            );

            setCatFeatures(scatterplotCatFeatures);
            setCatFeature(scatterplotCatFeatures[1]);
        } else {
            setCatFeatures(cat_features_generic);

            // TODO always resets to k_mean_cluster
            setCatFeature("k_mean_cluster");
        }
    }

    // features for PCA, biplot axis:
    const [biplotFeatures, setBiplotFeatures] =
        useState<string[]>(biplot_features_init);

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
                    await d3.csv("dataset/noisy.csv")
                ).map((r) => Patient.fromJson(r));
                console.log("Data loaded!", patientDataLoaded);

                // Step 2: Run PCA Analysis
                const newPcaLoadings = PCA_analysis({
                    patientsData: patientDataLoaded,
                    numFeatures: pca_num_features_list,
                });

                // Run Kmeans
                RunKmeans(patientDataLoaded, setPatientDataFunc, k);

                // Step 3: Update State
                setPatientData(patientDataLoaded);
                setPcaLoadings(newPcaLoadings);
                setDataLoaded(true); // Set this last to indicate both processes are done

                const correlations = calcCorrelations(
                    cov_features_init,
                    patientDataLoaded
                );
                setPearsonCorr(correlations);

                setMessageHistoFun([
                    ...initialPrompt,
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

    // ------------------------- chat -------------------------
    // use ref to avoid re-rendering for the input field for every key stroke
    const promptRef = useRef<HTMLInputElement>(null);
    // const [response, setResponse] = useState<string>("");

    const [shownMessages, setShownMessages] = useState<MessageHistory[]>([]);
    const [messageHisto, setMessageHisto] =
        useState<MessageHistory[]>(initialPrompt);
    const [ChatFeatureSuggestion, setChatFeatureSuggestion] = useState<
        [string, string]
    >(["", ""]);
    const [ChatFeatureHighlight, setChatFeatureHighlight] = useState<
        [string, string]
    >(["", ""]);

    function setMessageHistoFun(messages: MessageHistory[]) {
        setMessageHisto(messages);
        console.log("Message history updated:", messages);
    }

    function handleChatFeatureSuggestion(featureList: string[]) {
        // console.log("Features, ", featureList);

        // check if the features are valid in in the data
        if (featureList.every((feature) => allFeatures.includes(feature))) {
            console.log("Valid feature suggestion: ", featureList);
            setScatterplotFeatures([featureList[0], featureList[1]]);
            setChatFeatureSuggestion([featureList[0], featureList[1]]);
            return;
        } else {
            console.log("Invalid feature suggestion: ", featureList);
        }

        return;
    }

    function handleChatCodeResponse(codeResponse: ChatCodeRes) {
        // Handle the code response from the chat
        console.log("Chat code response received:", codeResponse);
        switch (codeResponse.functionName) {
            case "highlightFeature":
            case "highlightFeatures":
                // highlight feature(s) in the heatmap
                console.log("HighlightFeature(S) case triggered");
                const featureList: string[] = codeResponse.code;
                if (
                    featureList.length === 2 &&
                    featureList.every((feature) =>
                        cov_features.includes(feature)
                    )
                ) {
                    console.log("Valid feature highlighted: ", featureList);
                    // setScatterplotFeatures([featureList[0], featureList[1]]);
                    setChatFeatureHighlight([featureList[0], featureList[1]]);
                    return;
                } else {
                    console.log("Invalid feature highlighted: ", featureList);
                }
                break;

            case "none":
                // No specific action needed
                console.log("None case triggered");
                break;
            default:
                console.log(
                    "Invalid function name:",
                    codeResponse.functionName
                );
        }
    }

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [shownMessages]);

    // handle offcanvas
    const [showChat, setShowChat] = useState(false);
    const handleClose = () => setShowChat(false);
    const handleShow = () => setShowChat(!showChat);

    // ------------------------- JSX -------------------------
    return (
        <>
            {dataLoaded ? (
                <>
                    <div className="background-container">
                        <h1 className="heading">
                            Parkinson's disease analysis
                        </h1>

                        <div className="panels-container">
                            {/* Sidepanel start */}

                            <div
                                className={`sidepanel ${showChat ? "expanded" : "collapsed"}`}
                            >
                                <div className="sidepanel-header">
                                    <h5>Chatbot</h5>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        aria-label="Close"
                                        onClick={handleClose}
                                    ></button>
                                </div>
                                <div className="sidepanel-body">
                                    <div className="chat-prompt-container">
                                        <div className="container-suggest-clear-button">
                                            <Button
                                                variant="dark"
                                                onClick={() =>
                                                    clearChatHistory({
                                                        setMessageHistoFun,
                                                        setShownMessages,
                                                        initialPrompt,
                                                    })
                                                }
                                            >
                                                Clear History
                                            </Button>

                                            <div className="chat-suggest-button">
                                                <Button
                                                    variant="dark"
                                                    onClick={() =>
                                                        handleChatSubmitSuggest(
                                                            {
                                                                prompt:
                                                                    promptRef
                                                                        .current
                                                                        ?.value ||
                                                                    "",
                                                                messageHisto,
                                                                setMessageHistoFun,
                                                                shownMessages,
                                                                setShownMessages,
                                                                handleChatFeatureSuggestions:
                                                                    handleChatFeatureSuggestion,
                                                                handleChatCodeResponse,
                                                            }
                                                        )
                                                    }
                                                >
                                                    Suggest Features
                                                </Button>
                                            </div>
                                        </div>

                                        <p>Or ask your questions.</p>
                                        <div className="chat-textInput-container">
                                            <input
                                                type="text"
                                                ref={promptRef}
                                                placeholder="Enter your prompt here"
                                            />
                                            <Button
                                                variant="dark"
                                                onClick={() =>
                                                    handleChatSubmit({
                                                        prompt:
                                                            promptRef.current
                                                                ?.value || "",
                                                        messageHisto,
                                                        setMessageHistoFun,
                                                        shownMessages,
                                                        setShownMessages,
                                                        handleChatFeatureSuggestions:
                                                            handleChatFeatureSuggestion,
                                                        handleChatCodeResponse,
                                                    })
                                                }
                                            >
                                                Submit
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="chat-messages">
                                        {shownMessages
                                            .filter(
                                                (msg) =>
                                                    msg.role === "user" ||
                                                    msg.role === "assistant"
                                            )
                                            .map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`chat-message ${
                                                        msg.role === "user"
                                                            ? "user-message"
                                                            : "assistant-message"
                                                    }`}
                                                >
                                                    <ReactMarkdown>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </div>

                            {/* Sidepanel end */}
                            <div
                                className={`mainpanel ${showChat ? "sp-expanded" : "sp-collapsed"}`}
                            >
                                <div className="heatmap-scatterplots-grid">
                                    <div className="flex-container-column ">
                                        <div className="flex-container-row">
                                            <Button
                                                variant="dark"
                                                onClick={handleShow}
                                                className="show-chat-button"
                                            >
                                                Show Chat assistant.
                                            </Button>
                                            <h3 className="pearsonCorrelation-heading">
                                                Pearson Correlation for selected
                                                features
                                            </h3>
                                        </div>

                                        <div className="checkbox-container">
                                            {cov_features.map((feature) => (
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
                                                cov_features={
                                                    selectedCovFeatures
                                                }
                                                selectedFeatures={
                                                    scatterplotFeatures
                                                }
                                                chatFeatureSuggestion={
                                                    ChatFeatureSuggestion
                                                }
                                                chatFeatureHighlight={
                                                    ChatFeatureHighlight
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
                                                            {
                                                                scatterplotFeatures[1]
                                                            }
                                                        </h4>
                                                    ) : (
                                                        <h4 className="plot-headings">
                                                            {
                                                                scatterplotFeatures[1]
                                                            }{" "}
                                                            vs{" "}
                                                            {
                                                                scatterplotFeatures[0]
                                                            }
                                                        </h4>
                                                    )}
                                                    <select
                                                        name="catFeature"
                                                        style={{
                                                            visibility:
                                                                catFeatures.length >
                                                                0
                                                                    ? "visible"
                                                                    : "hidden",
                                                        }} // Use style attribute to set visibility
                                                        id="catFeature"
                                                        className="single-select-dropdown"
                                                        value={catFeature}
                                                        onChange={(e) =>
                                                            setCatFeature(
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        {catFeatures.map(
                                                            (f) => (
                                                                <option
                                                                    key={f}
                                                                    value={f}
                                                                >
                                                                    {f}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                                {scatterplotFeatures[0] ==
                                                scatterplotFeatures[1] ? (
                                                    <PlotHisto
                                                        patients_data={
                                                            patients_data
                                                        }
                                                        selected_feature={
                                                            scatterplotFeatures[0]
                                                        }
                                                        k_mean_clusters={k}
                                                        catFeature={catFeature}
                                                    />
                                                ) : (
                                                    <PlotScatterplot
                                                        x_feature={
                                                            scatterplotFeatures[0]
                                                        }
                                                        y_feature={
                                                            scatterplotFeatures[1]
                                                        }
                                                        patients_data={
                                                            patients_data
                                                        }
                                                        categorical_feature={
                                                            catFeature
                                                        }
                                                        k_mean_clusters={k}
                                                        showCatLinReg={false}
                                                        showCatAvg={true}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <p>
                                                {" "}
                                                No features Selected for
                                                Scatterplot
                                            </p>
                                        )}
                                        <div>
                                            <div className="pca-heading-container">
                                                <h4 className="plot-headings">
                                                    PCA Analysis
                                                </h4>
                                                <div>
                                                    <MultiSelectDropdown
                                                        options={
                                                            pca_num_features_list
                                                        }
                                                        selectedOptions={
                                                            biplotFeatures
                                                        }
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
                                                        setK(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
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
                                                numFeatures={
                                                    pca_num_features_list
                                                }
                                                loadings={pcaLoadings}
                                                biplotFeatures={biplotFeatures}
                                                showKmeans={!(k === 1)}
                                            />
                                        </div>
                                    </div>
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
