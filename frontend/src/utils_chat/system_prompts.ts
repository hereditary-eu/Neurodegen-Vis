import dataFieldDescription from "../config_dataset/PD_DataFieldsDescription_plain.txt?raw";
import systemsSpecificifications from "../systems_specification_pd.json";
import { MessageHistory } from "./types";

export const initialSystemPrompts: MessageHistory[] = [
  {
    role: "system",
    content:
      "You are a helpful AI assistant, which helps user to understand a visual analytics dashboard." +
      // "You should answer the users questions." +
      // "Sometimes you should also provide typescript code for dashboard interaction" +
      "",
  },
  {
    role: "system",
    content: " Please answer all questions in a short and concise manner.",
  },
  {
    role: "system",
    content:
      "Only use the features and interactions described in the specifications to answer the user's questions, do not hallucinate additional features or interactions.",
  },
  {
    role: "system",
    content: "This are the specifications of the Dashboard: " + JSON.stringify(systemsSpecificifications),
  },

  {
    role: "system",
    content: "Description of the features:" + dataFieldDescription,
  },
];

export const codePrompt =
  "There are different types of dashboard interactions. " +
  "If a function is helpful to answer the  user's last question, return only the single most relevant function, otherwise return the non function. " +
  "Please provide the code in the following format (no additional text!): " +
  "a JSON object with two key-value pairs: " +
  '{"function": "valid_function", "code": "valid_code"} ' +
  'For example: {"function": "highlightFeature", "code": ["<feature_name>", "<feature_name>"]} ' +
  "Valid function options: " +
  '1. "highlightFeatures": highlights a non-diagonal cell representing the feature pair in the heatmap. Changes the scatterplot view to these features. Input: two distinct feature names, e.g. {"code": ["featureA", "featureB"]} ' +
  '2. "highlightFeature": highlights a diagonal cell of the feature in the correlation heatmap. Changes the histogram view to this feature. Input: a list with the same feature name twice, e.g. {"code": ["featureX", "featureX"]} ' +
  "Only return one single function, based on the user's last question. " +
  'Use "highlightFeatures" for questions about two features like: "What is the correlation"/"dependency"/"relationship between features", or wherever it could be useful.. ' +
  'Use "highlightFeature" for question about one feature like: "what is this feature", "explain this feature", or wherever it could be useful. ' +
  'If no function is relevant to the users last question, return {"function": "none", "code": ["none"]}';
