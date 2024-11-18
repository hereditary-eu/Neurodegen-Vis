import { useEffect, useState, useRef } from "react";
import "./App.css";
import "./dropdown.css";
import * as d3 from "d3";
// import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";
import { categorial_keys_list } from "./categorical_keys_list";
import { numerical_keys_list } from "./numerical_keys_list";
import { zTestMethodsMapping } from "./zTestMethodsMapping";
import PCA_analysis from "./PCA";
import {
    PlotAgeHisto,
    PlotCorHeatmap,
    PlotScatterplot,
} from "./Heatmap_Scatterplots";

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
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on",
        "rc_score_done",
        "sdmt_done",
        "flu_a_done",
        "phon_flu_done",
    ];

    const covFeatures_init: string[] = [
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
        "st_ter_daed",
        "st_ter_leed",
        "updrs_3_on",
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
        zTestMethodsMapping[scatterplotFeatures[1]]
    );

    const [zTestCatFeature, setZTestCatFeature] = useState<string>(
        zTestMethods[0]
    );

    function heatmapSetsScatterplotFeatures(features: [string, string]) {
        setScatterplotFeatures(features);
        // console.log("z Methods", Object.keys(zTestMethodsMapping));
        if (Object.keys(zTestMethodsMapping).includes(features[1])) {
            setZTestMethods(zTestMethodsMapping[features[1]]);
            setZTestCatFeature(zTestMethodsMapping[features[1]][0]);
        } else {
            setZTestMethods([]);
            setZTestCatFeature("");
        }
        // console.log(features[1]);
        // console.log("z Methods", zTestMethodsMapping[features[1]]);
    }

    // heatmapSetsScatterplotFeatures(["insnpsi_age", "npsid_rep_moca_c"]);
    // console.log("scatterplot_features", scatterplotFeatures);

    // 32 overall_domain_sum ... sum of all failed tests. (z-scores below -11)
    // 9.	npsid_rep_moca_c: Raw result of Montreal Cognitive Assessment (MoCA) test (rep can be ignored, it is related to the fact that the variable is repeated in the data base).
    // 10.	npsid_rep_mmse_c: Raw result of Mini-Mental State Examination (MMSE) test.

    // categorical features:
    // 13. npsid_cog_stat : Cognitive status of the patient: 1=NoCognitiveImpairment; 2=MildCognitiveImpairment-single-domain; 3-MildCognitiveImpairment-multiple-domain; 4-Dementia

    // compare overall cognitve results, cognitve states, with this categorical ... done stuff.

    // features for PCA, biplot axis:
    const [biplotFeatures, setBiplotFeatures] = useState<string[]>([
        "npsid_ddur_v",
        "insnpsi_age",
        "visuosp_z_comp",
        "exec_z_comp",
        "npsid_rep_mmse_c",
    ]);

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);

    let emptyPatient: Patient = new Patient();
    const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54

    useEffect(() => {
        console.log("Loading data...");
        async function load() {
            let loaded = (
                await d3.csv("dataset/PD_SampleData_Curated.csv")
            ).map((r) => Patient.fromJson(r));
            setData(loaded);
            console.log("Data loaded!", patients_data);
            setDataLoaded(true);
        }
        load().catch(console.error);
    }, []);

    console.log("Data loaded?", dataLoaded);
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
                                <h2>
                                    Pearson Correlation for selected features
                                </h2>
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
                                        setSelectedFeatures={
                                            heatmapSetsScatterplotFeatures
                                        }
                                    />
                                </div>
                            </div>

                            <div className="container-column ">
                                {scatterplotFeatures[0] !== "" &&
                                scatterplotFeatures[1] !== "" ? (
                                    <div>
                                        <div className="pca-heading-container">
                                            <h3 className="plot-headings">
                                                {scatterplotFeatures[1]} vs{" "}
                                                {scatterplotFeatures[0]}
                                            </h3>
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
                                                onChange={(e) =>
                                                    setZTestCatFeature(
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

                                        <PlotScatterplot
                                            x_feature={scatterplotFeatures[0]}
                                            y_feature={scatterplotFeatures[1]}
                                            patients_data={patients_data}
                                            categorical_feature={
                                                zTestCatFeature
                                            }
                                            showCatLinReg={false}
                                            showCatAvg={true}
                                        />
                                    </div>
                                ) : (
                                    <p> No features Selected for Scatterplot</p>
                                )}
                                <div>
                                    <div className="pca-heading-container">
                                        <h3 className="plot-headings">
                                            PCA Analysis
                                        </h3>
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
                                    <PCA_analysis
                                        patientsData={patients_data}
                                        numFeatures={numerical_keys_list}
                                        biplotFeatures={biplotFeatures}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div></div>
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
