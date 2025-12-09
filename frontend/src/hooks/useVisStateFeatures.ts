import { useState } from "react";
import { initialSystemPrompts } from "../utils_chat/system_prompts";
import { MessageHistory } from "../utils_chat/types";
import { cov_features } from "../data/variables_feature_lists";
import * as d3 from "d3";
import { Patient } from "../data/Patient";
import {
  cov_features_init,
  scatterplot_features_init,
  cat_features_generic,
  cat_features_mapping,
  biplot_features_init,
} from "../data/variables_feature_lists";

export function useVisStateFeatures() {
  // all features should be all the keys from the Patient class
  const allFeatures = Object.keys(new Patient());

  // visualisation hooks
  const [selectedCovFeatures, setSelectedCovFeatures] = useState<string[]>(cov_features_init);

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

  const [scatterplotFeatures, setScatterplotFeatures] = useState<[string, string]>(scatterplot_features_init);

  const [catFeatures, setCatFeatures] = useState<string[]>(
    cat_features_generic.concat(cat_features_mapping[scatterplotFeatures[1]]),
  );

  // ToDO always resets to k_mean_cluster
  const [catFeature, setCatFeature] = useState<string>(catFeatures[1]);

  function heatmapSetsScatterplotFeatures(features: [string, string]) {
    setScatterplotFeatures(features);

    let scatterplotCatFeatures: string[] = cat_features_generic;

    // console.log("z Methods", Object.keys(zTestMethodsMapping));
    if (Object.keys(cat_features_mapping).includes(features[1])) {
      // scatterplotCatFeatures;
      scatterplotCatFeatures = scatterplotCatFeatures.concat(cat_features_mapping[features[1]]);

      setCatFeatures(scatterplotCatFeatures);
      setCatFeature(scatterplotCatFeatures[1]);
    } else {
      setCatFeatures(cat_features_generic);

      // TODO always resets to k_mean_cluster
      setCatFeature("k_mean_cluster");
    }
  }

  // features for PCA, biplot axis:
  const [biplotFeatures, setBiplotFeatures] = useState<string[]>(biplot_features_init);

  return {
    allFeatures,
    selectedCovFeatures,
    handleCheckboxChange,
    scatterplotFeatures,
    setScatterplotFeatures,
    heatmapSetsScatterplotFeatures,
    catFeatures,
    catFeature,
    setCatFeature,
    biplotFeatures,
    setBiplotFeatures,
  };
}
