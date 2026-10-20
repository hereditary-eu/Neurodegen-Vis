import { useEffect, useRef } from "react";
import "../../css/App.css";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { Patient } from "../../data/Patient";
import { pearsonCorrelation } from "../../utils/pearson_correlation";
import { FONTSIZE } from "./vis_variables";
import { cov_features_labels_it } from "../../data/variables_feature_lists";

const labelIt = (feature: string) => cov_features_labels_it[feature] ?? feature;

interface CorHeatmapProps {
  patients_data: Patient[];
  cov_features: string[];
  selectedFeatures: [string, string];
  setSelectedFeatures: (selectedFeatures: [string, string]) => void;
  chatFeatureSuggestion: [string, string];
  chatFeatureHighlight: [string, string];
  setCorrelations: (correlations: { a: string; b: string; correlation: number }[]) => void;
  correlations: { a: string; b: string; correlation: number }[];
  specialMode?: boolean;
} // Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap

/**
 * Creates and renders the correlation heatmap
 */
function PlotCorHeatmap({
  patients_data,
  cov_features,
  selectedFeatures,
  chatFeatureSuggestion,
  chatFeatureHighlight,
  setSelectedFeatures,
  setCorrelations,
  correlations,
  specialMode = false,
}: CorHeatmapProps) {
  const corr_heatmap_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element

  // Special mode only draws the lower triangle (upper triangle mirrors it, so it's redundant).
  // Cells are filtered out of the rendered data entirely rather than hidden, since Plot.cell
  // binds each <rect> to a plain array index (not the datum) - the index into this filtered
  // array is what "positional index" lookups below must use.
  function getCellData(corrArr: { a: string; b: string; correlation: number }[]) {
    if (!specialMode) return corrArr;
    return corrArr.filter((d) => cov_features.indexOf(d.b) >= cov_features.indexOf(d.a));
  }

  // only called in UseEffect to ommit unecessary calculations
  useEffect(() => {
    // d3.cross returns the cartesian product (all possible combinations) of the two arrays
    console.log("PlotCorHeatmap fun started");
    console.log("selectedFeatures", selectedFeatures);
    let correlationsNew = d3.cross(cov_features, cov_features).map(([a, b]) => ({
      a,
      b,
      correlation: pearsonCorrelation(Plot.valueof(patients_data, a) ?? [], Plot.valueof(patients_data, b) ?? []),
    }));
    // console.log("correlations", correlations);
    setCorrelations(correlationsNew);

    const heatmap_width = cov_features.length * 65 + 165;
    const heatmap_height = cov_features.length * 35 + 155;

    const cellData = getCellData(correlationsNew);

    const corr_heatmap = Plot.plot({
      width: heatmap_width, // Set the overall width of the heatmap
      height: heatmap_height, // Set the overall height of the heatmap (adjust for number of features)
      marginLeft: 134,
      marginBottom: 132,
      label: null,
      color: specialMode
        ? {
            scheme: "reds", // color intensity = strength of correlation, direction dropped
            domain: [0, 1],
            legend: true,
            label: "correlazione (valore assoluto)",
            tickFormat: (v: number) => (v >= 0.5 ? "Alta" : "Bassa"),
          }
        : {
            scheme: "buylrd", // blue-red color scheme
            pivot: 0, // Zero as the midpoint
            legend: true, // Display a color legend
            label: "correlation", // Label for the legend
          },
      x: {
        // label: "Features (X)",
        domain: cov_features, // Order the x-axis according to cov_features
        tickRotate: 90, // Rotate the x-axis tick labels by 90 degrees
        tickFormat: specialMode ? labelIt : undefined,
      },
      y: {
        // label: "Features (Y)",
        domain: cov_features, // Order the y-axis according to cov_features
        tickFormat: specialMode ? labelIt : undefined,
      },
      marks: [
        Plot.cell(cellData, {
          x: "a",
          y: "b",
          fill: specialMode ? (d) => Math.abs(d.correlation) : "correlation",
          className: "heatmap-cell",
        }),
        ...(specialMode
          ? []
          : [
              Plot.text(cellData, {
                x: "a",
                y: "b",
                text: (d) => d.correlation.toFixed(2), // toFixed(2) to convert number to string and display only 2 decimal places
                fill: (d) => (d.correlation > 0.8 || d.correlation < -0.6 ? "white" : "black"),
                fontSize: 12, //fontsize of correlation values
                className: "heatmap-cell",
              }),
            ]),
      ],
      style: "font-size: " + FONTSIZE + "; --plot-axis-tick-rotate: 90deg;",
    });

    // adapted from https://observablehq.com/@ambassadors/interactive-plot-dashboard
    const rects = d3.select(corr_heatmap).selectAll("rect");

    function HighlightCell(idx1d: number) {
      rects.style("fill-opacity", "1"); // Reset fill opacity for all cells
      rects.style("stroke", "none"); // Reset stroke for all cells

      // Change only the fill opacity, so the stroke remains fully visible
      d3.select(rects.nodes()[idx1d]).style("fill-opacity", "0.5");
    }

    d3.select(corr_heatmap)
      // .selectAll("rect")
      .on("click", function (event) {
        const target = event.target as Element; // cell
        if (target.parentElement?.classList.contains("heatmap-cell")) {
          // copy the children of the parent element to an array and get the index of the cell
          let idx1d = [...target.parentElement.children].indexOf(target);
          const { a, b } = cellData[idx1d];

          console.log("Clicked on cell", a, b);
          setSelectedFeatures([a, b]);

          HighlightCell(idx1d);
        }
      })
      .on("pointerover", function (event) {
        const target = event.target as Element; // cell

        // check if target has class head-map-cell
        if (target.parentElement?.classList.contains("heatmap-cell")) {
          let idx1d = [...target.parentElement.children].indexOf(target);

          d3.select(target).style("cursor", "pointer");
          // highlight the according rectangle from rects
          d3.select(rects.nodes()[idx1d]).style("stroke", "black").style("stroke-width", 3.5);
        }
      })
      .on("pointerout", function (event) {
        const target = event.target as Element; // Get the target of the pointer event

        // Ensure the target is part of a heatmap cell (either the rectangle or the text)
        if (target.parentElement?.classList.contains("heatmap-cell")) {
          let idx1d = [...target.parentElement.children].indexOf(target);

          // Reset the stroke on the corresponding rect
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }
      });

    // ✅ **Highlight cell on first render
    const defaultIdx1d = cellData.findIndex(
      (d) =>
        (d.a === selectedFeatures[0] && d.b === selectedFeatures[1]) ||
        (d.a === selectedFeatures[1] && d.b === selectedFeatures[0])
    );

    if (defaultIdx1d !== -1) {
      HighlightCell(defaultIdx1d);
    }

    if (corr_heatmap_ref.current) {
      corr_heatmap_ref.current.innerHTML = ""; // Clear the div
      corr_heatmap_ref.current.appendChild(corr_heatmap);
    }
  }, [patients_data, cov_features]); //called every time an input changes

  // New effect for updating the cell highlight when selectedFeatures or GPT suggestions change
  // TODO, should not "unhighlight" the scatterplot selected cell, just border highlight the new one
  useEffect(() => {
    console.log("Update cell highlight for ChatGPT suggestion");
    if (corr_heatmap_ref.current) {
      const rects = d3.select(corr_heatmap_ref.current).selectAll("rect");
      const cellData = getCellData(correlations);

      function HighlightCell(idx1d: number) {
        let corr = cellData[idx1d].correlation;
        if (corr > 0.5 || corr < -0.8) {
          d3.select(rects.nodes()[idx1d])
            .style("stroke", "#E6E6FA")
            .style("stroke-width", 4);
        } else {
          d3.select(rects.nodes()[idx1d]).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 15 seconds
        setTimeout(() => {
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }, 15000);
      }

      // rendered cell may only exist as (a,b) or its mirror (b,a) depending on the triangle shown
      const idx1d = cellData.findIndex(
        (d) =>
          (d.a === chatFeatureHighlight[0] && d.b === chatFeatureHighlight[1]) ||
          (d.a === chatFeatureHighlight[1] && d.b === chatFeatureHighlight[0])
      );
      if (idx1d !== -1) {
        HighlightCell(idx1d);
      }
    }
  }, [chatFeatureHighlight]);

  // New effect for updating the cell highlight when selectedFeatures or GPT suggestions change
  // TODO, should not "unhighlight" the scatterplot selected cell, just border highlight the new one
  useEffect(() => {
    console.log("Update cell highlight for ChatGPT suggestion");
    if (corr_heatmap_ref.current) {
      const rects = d3.select(corr_heatmap_ref.current).selectAll("rect");
      const cellData = getCellData(correlations);

      function HighlightCell(idx1d: number) {
        rects.style("fill-opacity", "1"); // Reset fill opacity for all cells
        rects.style("stroke", "none"); // Reset stroke for all cells

        // Highlight cell with border
        let corr = cellData[idx1d].correlation;
        if (corr > 0.5 || corr < -0.8) {
          d3.select(rects.nodes()[idx1d]).style("stroke", "#E6E6FA").style("stroke-width", 4);
        } else {
          d3.select(rects.nodes()[idx1d]).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 10 seconds
        setTimeout(() => {
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }, 15000);

        // Change only the fill opacity, so the stroke remains fully visible
        d3.select(rects.nodes()[idx1d]).style("fill-opacity", "0.5");
      }

      // rendered cell may only exist as (a,b) or its mirror (b,a) depending on the triangle shown
      const idx1d = cellData.findIndex(
        (d) =>
          (d.a === chatFeatureSuggestion[0] && d.b === chatFeatureSuggestion[1]) ||
          (d.a === chatFeatureSuggestion[1] && d.b === chatFeatureSuggestion[0])
      );
      if (idx1d !== -1) {
        HighlightCell(idx1d);
      }
    }
  }, [chatFeatureSuggestion]);

  return <div ref={corr_heatmap_ref}></div>;
}

export { PlotCorHeatmap };
