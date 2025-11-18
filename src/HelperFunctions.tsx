import { Patient } from "./env_dataset/Patient";

interface MinMaxPatProps {
  y_feature: string;
  x_feature: string;
  patients_data: Patient[];
}
/**
 * Calculates the min and max values for the specified features in patient data, adding a margin.
 */
function CalcMinMaxPatientsData({ y_feature, x_feature, patients_data }: MinMaxPatProps) {
  // console.log("min-max patients data started");
  const min_x = Math.min(...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d)));
  const max_x = Math.max(...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d)));
  const min_y = Math.min(...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d)));
  const max_y = Math.max(...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d)));
  const x_range = max_x - min_x;
  const y_range = max_y - min_y;
  const marginFactor = 0.03;
  return [
    min_x - x_range * marginFactor,
    max_x + x_range * marginFactor,
    min_y - y_range * marginFactor,
    max_y + y_range * marginFactor,
  ];
}

interface MinMaxMatrixProps {
  matrix: number[][];
  feature_1: number;
  feature_2: number;
}
/**
 * Calculates the min and max values for the specified features in a numerical matrix, adding a margin.
 */
function CalcMinMaxMatrix({ matrix, feature_1, feature_2 }: MinMaxMatrixProps) {
  console.log("Min-max matrix started");
  const min_x = Math.min(...matrix.map((p) => p[feature_1]).filter((d) => !isNaN(d)));
  const max_x = Math.max(...matrix.map((p) => p[feature_1]).filter((d) => !isNaN(d)));
  const min_y = Math.min(...matrix.map((p) => p[feature_2]).filter((d) => !isNaN(d)));
  const max_y = Math.max(...matrix.map((p) => p[feature_2]).filter((d) => !isNaN(d)));
  const x_range = max_x - min_x;
  const y_range = max_y - min_y;
  const marginFactor = 0.03;
  return [
    min_x - x_range * marginFactor,
    max_x + x_range * marginFactor,
    min_y - y_range * marginFactor,
    max_y + y_range * marginFactor,
  ];
}

export { CalcMinMaxPatientsData, CalcMinMaxMatrix };
