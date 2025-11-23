import { Patient } from "../../env_dataset/Patient";
import { PCA } from "ml-pca";

interface PCAAnalysisProps {
  patientsData: Patient[];
  numFeatures: string[];
}

/**
 * Performs PCA analysis on patient data and updates patient objects with PCA results.
 */
function PCA_analysis({ patientsData: patientsData, numFeatures: numFeatures }: PCAAnalysisProps) {
  console.log("PCA_analysis started");

  // Step 1: Track the indices of valid rows
  const validIndices: number[] = []; // Stores the original indices of valid rows

  const patients_data_num = patientsData
    .map((patient, index) => {
      const row = numFeatures.map((feature) => patient[feature]);
      if (row.includes(NaN)) {
        return null; // Mark as invalid
      }
      validIndices.push(index); // Keep track of valid rows
      return row;
    })
    .filter((row) => row !== null); // Remove invalid rows

  // Step 2: Perform PCA on valid numerical data
  const pca = new PCA(patients_data_num, { scale: true, center: true });
  const pcaProjections_object = pca.predict(patients_data_num);
  const pcaProjections: number[][] = pcaProjections_object.to2DArray(); // Use appropriate method to get data
  // const pcaProjections: number[][] = pcaProjections_object["data"];

  // Step 3: Map PCA projections back to the correct patients
  validIndices.forEach((originalIndex, i) => {
    const patient = patientsData[originalIndex]; // Retrieve the original patient
    patient.pc1 = pcaProjections[i][0];
    patient.pc2 = pcaProjections[i][1];
    patient.valid_pc = true;
  });

  // Step 4: For patients with NaN values, set PC to NaN
  patientsData.forEach((Patient, index) => {
    if (!validIndices.includes(index)) {
      Patient.pc1 = NaN;
      Patient.pc2 = NaN;
      Patient.valid_pc = false;
    }
  });

  // const loadings = pca.getLoadings().data;
  const loadings = pca.getLoadings().to2DArray(); // Use appropriate method to get data

  return loadings;
}

export { PCA_analysis };
