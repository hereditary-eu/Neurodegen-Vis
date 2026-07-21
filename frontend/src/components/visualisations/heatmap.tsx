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
  specialMode = false,
}: CorHeatmapProps) {
  const corr_heatmap_ref = useRef<HTMLDivElement>(null); // Create a ref to access the div element

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

    // Standard lower-triangular matrix reading order: row 0 at the top, increasing downward.
    // Keep cells where the row (b) is on/below the diagonal relative to the column (a).
    const isLowerTriangle = (d: { a: string; b: string }) =>
      cov_features.indexOf(d.b) >= cov_features.indexOf(d.a);

    const cellData = specialMode ? correlationsNew.filter(isLowerTriangle) : correlationsNew;

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
    // rects are looked up by their bound datum (a/b feature pair) rather than a positional
    // index, since specialMode renders fewer than cov_features.length^2 cells.
    const rects = d3.select(corr_heatmap).selectAll<SVGRectElement, { a: string; b: string; correlation: number }>(
      "rect"
    );

    function findRectNode(a: string, b: string) {
      return rects.filter((d) => d.a === a && d.b === b).node();
    }

    function HighlightCell(a: string, b: string) {
      rects.style("fill-opacity", "1"); // Reset fill opacity for all cells
      rects.style("stroke", "none"); // Reset stroke for all cells

      // Change only the fill opacity, so the stroke remains fully visible
      const node = findRectNode(a, b);
      if (node) d3.select(node).style("fill-opacity", "0.5");
    }

    d3.select(corr_heatmap)
      // .selectAll("rect")
      .on("click", function (event) {
        let target = event.target; // cell
        if (target.parentElement.classList.contains("heatmap-cell")) {
          const d = d3.select(target).datum() as { a: string; b: string } | undefined;
          if (!d) return;

          console.log("Clicked on cell", d.a, d.b);
          setSelectedFeatures([d.a, d.b]);

          HighlightCell(d.a, d.b);
        }
      })
      .on("pointerover", function (event) {
        let target = event.target; // cell

        // check if target has class head-map-cell
        if (target.parentElement.classList.contains("heatmap-cell")) {
          const d = d3.select(target).datum() as { a: string; b: string } | undefined;
          if (!d) return;

          d3.select(target).style("cursor", "pointer");
          const node = findRectNode(d.a, d.b);
          if (node) d3.select(node).style("stroke", "black").style("stroke-width", 3.5);
        }
      })
      .on("pointerout", function (event) {
        let target = event.target; // Get the target of the pointer event

        // Ensure the target is part of a heatmap cell (either the rectangle or the text)
        if (target.parentElement.classList.contains("heatmap-cell")) {
          const d = d3.select(target).datum() as { a: string; b: string } | undefined;
          if (!d) return;

          const node = findRectNode(d.a, d.b);
          if (node) d3.select(node).style("stroke", "none");
        }
      });

    // ✅ **Highlight cell on first render
    if (cov_features.includes(selectedFeatures[0]) && cov_features.includes(selectedFeatures[1])) {
      HighlightCell(selectedFeatures[0], selectedFeatures[1]);
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
      const rects = d3
        .select(corr_heatmap_ref.current)
        .selectAll<SVGRectElement, { a: string; b: string; correlation: number }>("rect");

      function HighlightCell(a: string, b: string) {
        // rendered cell may only exist as (a,b) or its mirror (b,a) depending on the triangle shown
        const match = rects.filter((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));
        const node = match.node();
        if (!node) return;
        const corr = match.datum().correlation;

        if (corr > 0.5 || corr < -0.8) {
          d3.select(node)
            .style("stroke", "#E6E6FA")
            .style("stroke-width", 4);
        } else {
          d3.select(node).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 15 seconds
        setTimeout(() => {
          d3.select(node).style("stroke", "none");
        }, 15000);
      }

      if (chatFeatureHighlight[0] && chatFeatureHighlight[1]) {
        HighlightCell(chatFeatureHighlight[0], chatFeatureHighlight[1]);
      }
    }
  }, [chatFeatureHighlight]);

  // New effect for updating the cell highlight when selectedFeatures or GPT suggestions change
  // TODO, should not "unhighlight" the scatterplot selected cell, just border highlight the new one
  useEffect(() => {
    console.log("Update cell highlight for ChatGPT suggestion");
    if (corr_heatmap_ref.current) {
      const rects = d3
        .select(corr_heatmap_ref.current)
        .selectAll<SVGRectElement, { a: string; b: string; correlation: number }>("rect");

      function HighlightCell(a: string, b: string) {
        rects.style("fill-opacity", "1"); // Reset fill opacity for all cells
        rects.style("stroke", "none"); // Reset stroke for all cells

        // rendered cell may only exist as (a,b) or its mirror (b,a) depending on the triangle shown
        const match = rects.filter((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a));
        const node = match.node();
        if (!node) return;
        const corr = match.datum().correlation;

        if (corr > 0.5 || corr < -0.8) {
          d3.select(node).style("stroke", "#E6E6FA").style("stroke-width", 4);
        } else {
          d3.select(node).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 10 seconds
        setTimeout(() => {
          d3.select(node).style("stroke", "none");
        }, 15000);

        // Change only the fill opacity, so the stroke remains fully visible
        d3.select(node).style("fill-opacity", "0.5");
      }

      if (chatFeatureSuggestion[0] && chatFeatureSuggestion[1]) {
        HighlightCell(chatFeatureSuggestion[0], chatFeatureSuggestion[1]);
      }
    }
  }, [chatFeatureSuggestion]);

  return <div ref={corr_heatmap_ref}></div>;
}

export { PlotCorHeatmap };
