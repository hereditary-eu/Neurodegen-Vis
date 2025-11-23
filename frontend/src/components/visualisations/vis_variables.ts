const FONTSIZE = "14px";

const CLUSTERCOLORS: { [key: number]: string } = {
  [-1]: "#ffffff", // white => cluster -1
  0: "#1f77b4", // Blue
  1: "#ff7f0e", // Orange
  2: "#2ca02c", // Green
  3: "#9467bd", // Purple
  4: "#8c564b", // Brown
  5: "#e377c2", // Pink
  6: "#7f7f7f", // Gray
  7: "#bcbd22", // Yellow-Green
  8: "#17becf", // Cyan
  9: "#aec7e8", // Light Blue
  10: "#ffbb78", // Light Orange
  11: "#98df8a", // Light Green
  12: "#ff9896", // Light Red
  13: "#c5b0d5", // Light Purple
  14: "#c49c94", // Tan
  15: "#f7b6d2", // Light Pink
  16: "#c7c7c7", // Light Gray
  17: "#dbdb8d", // Light Yellow-Green
  18: "#9edae5", // Light Cyan
  19: "#dadaeb", // Light Light Blue
};

const COLORS_BIN: { [key: number]: string } = {
  1: "green",
  0: "orange",
};
const COLORS_BIN_STR: { [key: string]: string } = {
  Done: "green",
  "Not Done": "orange",
};

export { FONTSIZE, CLUSTERCOLORS, COLORS_BIN, COLORS_BIN_STR };
