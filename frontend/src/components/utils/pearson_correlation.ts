import * as d3 from "d3";

// Adapted from https://observablehq.com/@observablehq/plot-correlation-heatmap
/**
 * Function to calculate the Pearson correlation coefficient between two arrays
 */
function pearsonCorrelation(x: number[], y: number[]) {
  const n = x.length;
  if (y.length !== n) throw new Error("The two columns must have the same length.");

  // console.log("pearsonCorrelation fun started");
  // if array empty, d3 mean returns Nan, so we set it to 0
  const x_mean: number = d3.mean(x) ?? 0;
  const y_mean: number = d3.mean(y) ?? 0;

  const cov_xy = d3.sum(x, (_, i) => (x[i] - x_mean) * (y[i] - y_mean));
  const sigma_xx = d3.sum(x, (d) => (d - x_mean) ** 2);
  const sigma_yy = d3.sum(y, (d) => (d - y_mean) ** 2);
  return cov_xy / Math.sqrt(sigma_xx * sigma_yy);
}

export { pearsonCorrelation };
