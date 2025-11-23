import { useEffect, useRef } from "react";
import "../../css/App.css";
import * as Plot from "@observablehq/plot";
import { Patient } from "../../env_dataset/Patient";
import { CalcMinMaxPatientsData } from "../../HelperFunctions";
import { FONTSIZE, CLUSTERCOLORS, COLORS_BIN, COLORS_BIN_STR } from "./vis_variables";
import { LinReg, CalcAverage } from "../utils/scatterplot_utils";

// correlations of the form {a: string, b: string, correlation: number from all combinations of cov_features}
// correlations: {'string', 'string', 'number'}[]

interface ScatterplotProps {
  y_feature: string;
  x_feature: string;
  patients_data: Patient[];
  categoricalFeature: string;
  k_mean_clusters: number;
  show_dash?: boolean;
  showCatLinReg?: boolean;
  showCatAvg?: boolean;
}

/**
 * Creates and renders the scatterplot
 */
function PlotScatterplot({
  y_feature,
  x_feature,
  patients_data,
  categoricalFeature: categoricalFeature,
  k_mean_clusters,
  show_dash = false,
  showCatAvg = false,
  showCatLinReg = false,
}: ScatterplotProps) {
  // only called in UseEffect
  function createPlot() {
    console.log("Scatterplot fun started");
    patients_data = patients_data.filter((p) => !isNaN(p[x_feature] && p[y_feature]));

    let catFeatureSelected: boolean = categoricalFeature !== "" && categoricalFeature !== "None";

    let colors = COLORS_BIN;
    let k_mean_cluster_sel = false;
    let z_diagnosis_sel = false; // for z_diagnosis, we need to set the color to 0 and 1
    if (categoricalFeature === "k_mean_cluster") {
      if (k_mean_clusters === 1) {
        catFeatureSelected = false;
      } else {
        k_mean_cluster_sel = true;
        colors = CLUSTERCOLORS;
        showCatAvg = false;
        showCatLinReg = false;
      }
    }

    if (categoricalFeature === "z_diagnosis") {
      showCatAvg = false;
      showCatLinReg = false;
      z_diagnosis_sel = true; // for z_diagnosis, we need to set the color to 0 and 1
      // colors = CLUSTERCOLORS;
    }

    console.log(
      "catFeature: ",
      categoricalFeature,
      "; catFeatureSelected: ",
      catFeatureSelected,
      ", k_mean_cluster_sel: ",
      k_mean_cluster_sel,
      ", z_diagnosis_sel: ",
      z_diagnosis_sel,
    );

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
      patients_data.map((p) => p[y_feature]),
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
        .filter((d) => d[categoricalFeature] === 0) // also filters out NaN
        .map((p) => p[x_feature]),
      patients_data.filter((d) => d[categoricalFeature] === 0).map((p) => p[y_feature]),
    );
    linReg_y = linReg_x.map((x) => slope * x + intercept);
    const linRegData0 = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

    // Lin Reg Category 1!
    // [slope, intercept] = calcAverage(
    // [slope, intercept] = linReg(

    if (showCatLinReg) {
      [slope, intercept] = LinReg(
        patients_data
          .filter((d) => d[categoricalFeature] === 1) // also filters out NaN
          .map((p) => p[x_feature]),
        patients_data.filter((d) => d[categoricalFeature] === 1).map((p) => p[y_feature]),
      );
    } else {
      [slope, intercept] = CalcAverage(
        patients_data
          .filter((d) => d[categoricalFeature] === 1) // also filters out NaN
          .map((p) => p[x_feature]),
        patients_data.filter((d) => d[categoricalFeature] === 1).map((p) => p[y_feature]),
      );
    }

    linReg_y = linReg_x.map((x) => slope * x + intercept);
    const linRegData1 = linReg_x.map((x, i) => ({ x: x, y: linReg_y[i] }));

    function getTitle(d: Patient): string {
      let titleCatFeature: string = "";
      if (catFeatureSelected) {
        if (k_mean_cluster_sel) {
          titleCatFeature = "Cluster: " + d[categoricalFeature];
        } else if (z_diagnosis_sel) {
          titleCatFeature = categoricalFeature + ": " + d[categoricalFeature];
        } else {
          titleCatFeature = categoricalFeature + ": " + (d[categoricalFeature] === 0 ? "NOT Done" : "Done");
        }
        titleCatFeature += "\n";
      }

      return (
        "Patient ID: " +
        d["record_id"] +
        "\n" +
        titleCatFeature +
        x_feature +
        ": " +
        (typeof d[x_feature] === "number" ? d[x_feature].toFixed(2) : d[x_feature]) +
        "\n" +
        y_feature +
        ": " +
        (typeof d[y_feature] === "number" ? d[y_feature].toFixed(2) : d[y_feature])
      );
    }

    const pd_scatterplot = Plot.plot({
      marginBottom: 35,
      marks: [
        Plot.dot(patients_data, {
          x: x_feature,
          y: y_feature,
          ...(catFeatureSelected
            ? {
                // z_diagnosis is a string, need different syntax as the integer categorical_feature
                ...(z_diagnosis_sel
                  ? {
                      stroke: categoricalFeature,
                    }
                  : {
                      stroke: (d) => colors[d[categoricalFeature]],
                    }),
              }
            : {}),
          tip: true,
          title: getTitle,
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
        ...(catFeatureSelected && !z_diagnosis_sel && !k_mean_cluster_sel
          ? {
              legend: true,
              domain: Object.keys(COLORS_BIN_STR),
              range: Object.values(COLORS_BIN_STR),
            }
          : {}),
        ...(z_diagnosis_sel
          ? {
              legend: true,
            }
          : {}),
        ...(k_mean_cluster_sel
          ? {
              //   legend: true,
            }
          : {}),
      },
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
  }, [y_feature, x_feature, patients_data, categoricalFeature]); //called every time an input changes

  return (
    <>
      <div ref={scatterplot_ref}></div>
    </>
  );
}

export { PlotScatterplot };
