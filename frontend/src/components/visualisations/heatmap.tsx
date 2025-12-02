import { useEffect, useRef } from "react";
import "../../css/App.css";
import * as d3 from "d3";
import * as Plot from "@observablehq/plot";
import { Patient } from "../../data/Patient";
import { pearsonCorrelation } from "../../utils/pearson_correlation";
import { FONTSIZE } from "./vis_variables";

interface CorHeatmapProps {
  patients_data: Patient[];
  cov_features: string[];
  selectedFeatures: [string, string];
  setSelectedFeatures: (selectedFeatures: [string, string]) => void;
  chatFeatureSuggestion: [string, string];
  chatFeatureHighlight: [string, string];
  setCorrelations: (correlations: { a: string; b: string; correlation: number }[]) => void;
  correlations: { a: string; b: string; correlation: number }[];
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
        Plot.cell(correlationsNew, {
          x: "a",
          y: "b",
          fill: "correlation",
          className: "heatmap-cell",
        }),
        Plot.text(correlationsNew, {
          x: "a",
          y: "b",
          text: (d) => d.correlation.toFixed(2), // toFixed(2) to convert number to string and display only 2 decimal places
          fill: (d) => (d.correlation > 0.8 || d.correlation < -0.6 ? "white" : "black"),
          fontSize: 12, //fontsize of correlation values
          className: "heatmap-cell",
        }),
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
        let target = event.target; // cell
        if (target.parentElement.classList.contains("heatmap-cell")) {
          // copy the children of the parent element to an array and get the index of the cell
          let idx1d = [...target.parentElement.children].indexOf(target);
          const idx_x = Math.floor(idx1d / cov_features.length);
          const idx_y = idx1d % cov_features.length;

          console.log("Clicked on cell", idx_x, idx_y);
          setSelectedFeatures([cov_features[idx_x], cov_features[idx_y]]);

          // highlight cell
          // d3.select(rects.nodes()[idx1d]).style("stroke", "purple");
          HighlightCell(idx1d);
        }
      })
      .on("pointerover", function (event) {
        let target = event.target; // cell

        // check if target has class head-map-cell
        if (target.parentElement.classList.contains("heatmap-cell")) {
          let idx1d = [...target.parentElement.children].indexOf(target);

          d3.select(target).style("cursor", "pointer");
          // highlight the according rectangle from rects
          d3.select(rects.nodes()[idx1d]).style("stroke", "black").style("stroke-width", 3.5);
        }
      })
      .on("pointerout", function (event) {
        let target = event.target; // Get the target of the pointer event

        // Ensure the target is part of a heatmap cell (either the rectangle or the text)
        if (target.parentElement.classList.contains("heatmap-cell")) {
          let idx1d = [...target.parentElement.children].indexOf(target);

          // Reset the stroke on the corresponding rect
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }
      });

    // ✅ **Highlight cell on first render
    const defaultIdxX = cov_features.indexOf(selectedFeatures[0]);
    const defaultIdxY = cov_features.indexOf(selectedFeatures[1]);

    if (defaultIdxX !== -1 && defaultIdxY !== -1) {
      const defaultIdx1d = defaultIdxX * cov_features.length + defaultIdxY;
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

      function HighlightCell(idx1d: number) {
        let corr = correlations[idx1d].correlation;
        // console.log("Correlation for border highlight", corr);
        if (corr > 0.5 || corr < -0.8) {
          // console.log("Highlighting violet cell");
          d3.select(rects.nodes()[idx1d])
            .style("stroke", "#E6E6FA")
            // .style("stroke", "#D8BFD8")
            .style("stroke-width", 4);
        } else {
          // console.log("Highlighting purple cell");
          d3.select(rects.nodes()[idx1d]).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 15 seconds
        setTimeout(() => {
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }, 15000);
      }

      // Calculate the index based on the new selected features (or GPT suggestion)
      const idx_x = cov_features.indexOf(chatFeatureHighlight[0]);
      const idx_y = cov_features.indexOf(chatFeatureHighlight[1]);
      if (idx_x !== -1 && idx_y !== -1) {
        const idx1d = idx_x * cov_features.length + idx_y;

        // Update the highlighting without re-rendering the whole plot
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

      function HighlightCell(idx1d: number) {
        rects.style("fill-opacity", "1"); // Reset fill opacity for all cells
        rects.style("stroke", "none"); // Reset stroke for all cells

        // Highlight cell with border
        let corr = correlations[idx1d].correlation;
        // console.log("Correlation for border highlight", corr);
        if (corr > 0.5 || corr < -0.8) {
          // console.log("Highlighting violet cell");
          d3.select(rects.nodes()[idx1d]).style("stroke", "#E6E6FA").style("stroke-width", 4);
        } else {
          // console.log("Highlighting purple cell");
          d3.select(rects.nodes()[idx1d]).style("stroke", "purple").style("stroke-width", 4);
        }

        // Keep the border for 10 seconds
        setTimeout(() => {
          d3.select(rects.nodes()[idx1d]).style("stroke", "none");
        }, 15000);

        // Change only the fill opacity, so the stroke remains fully visible
        d3.select(rects.nodes()[idx1d]).style("fill-opacity", "0.5");
      }

      // Calculate the index based on the new selected features (or GPT suggestion)
      const idx_x = cov_features.indexOf(chatFeatureSuggestion[0]);
      const idx_y = cov_features.indexOf(chatFeatureSuggestion[1]);
      if (idx_x !== -1 && idx_y !== -1) {
        const idx1d = idx_x * cov_features.length + idx_y;

        // Update the highlighting without re-rendering the whole plot
        HighlightCell(idx1d);
      }
    }
  }, [chatFeatureSuggestion]);

  return <div ref={corr_heatmap_ref}></div>;
}

export { PlotCorHeatmap };
