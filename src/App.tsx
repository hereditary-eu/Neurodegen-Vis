import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
// import * as obsPlot from "observablehq/plot";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";

interface MichiProps {
  patients_data: Patient[];
  selected_feature: string;
}

function Michi({patients_data, selected_feature}: MichiProps) {

  console.log("Michi fun started");
  let binNumber = 8;

  let total_age: number = 0;
  patients_data.forEach((p) => {total_age += p.insnpsi_age;});

  let patients_age: number[] = [];
  patients_data.forEach((p) => {patients_age.push(p.insnpsi_age);});

  let patients_attent_z_comp: number[] = [];
  patients_data.forEach((p) => {patients_attent_z_comp.push(p.attent_z_comp);});

  // ----------------------------- scatterplot -----------------------------
  console.log("d3 image created");

  // Obsverable plot

  // const rand_histo = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
  const dur_histo = Plot.plot({
    marks: [
      // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
      Plot.rectY(patients_data, Plot.binX({y: "count", thresholds: binNumber}, {x: "npsid_ddur_v"})),
      Plot.ruleY([0]),
      // Plot.ruleX([0])
    ],
    x: {
      label: "Age",
      tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Frequency",
    },
  });
  const div_dur_histo = document.querySelector("#myplot");
  if (div_dur_histo) {
    div_dur_histo.innerHTML = ''; // Clear the div
    div_dur_histo.appendChild(dur_histo);
  }
  else {
    console.log("div not found");
  }

  const age_histo = Plot.plot({
    marks: [
      // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
      Plot.rectY(patients_data, Plot.binX({y: "count", thresholds: binNumber}, {x: "insnpsi_age"})),
      Plot.ruleY([0]),
      // Plot.ruleX([0])
    ],
    x: {
      label: "Age",
      tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Frequency",
    },
  });
  const age_histo_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (age_histo_ref.current) {
    age_histo_ref.current.innerHTML = ''; // Clear the div
    age_histo_ref.current.appendChild(age_histo);
    // histogramRef.current.appendChild(rand_histo);
  }

  console.log("obs plot created");
  return (
    <>
      <div className="flex-container">
        <div>
          <p>Age Distribution</p>
          <div ref={age_histo_ref}></div> 
        </div>
        <div>
          <p>Time since PD diagnosis Distribution</p>
          <div id="myplot"></div>
        </div>
      </div>
    </>
  );
}

function linReg(xArray: number[], yArray: number[]): [number, number] {
  // Calculate Sums
  console.log("linReg fun started");
  let xSum=0, ySum=0 , xxSum=0, xySum=0;
  let count = xArray.length;

  // remove NaN values
  for (let i = 0; i < count; i++) {
    if (isNaN(xArray[i]) || isNaN(yArray[i])) {
      xArray.splice(i, 1);
      yArray.splice(i, 1);
      count--;
    }
  }

  for (let i = 0, len = count; i < count; i++) {
    xSum += xArray[i];
    ySum += yArray[i];
    xxSum += xArray[i] * xArray[i];
    xySum += xArray[i] * yArray[i];
  }
  let slope = (count * xySum - xSum * ySum) / (count * xxSum - xSum * xSum);
  let intercept = (ySum / count) - (slope * xSum) / count;
  
  return [slope, intercept];
}


interface ScatterplotProps {
  y_feature: string;
  x_feature: string;
  patients_data: Patient[];
  show_dash?: boolean;
}

function calcMinMax({y_feature, x_feature, patients_data, show_dash=false}: ScatterplotProps){
  const min_x = Math.min(...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d)));
  const max_x = Math.max(...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d)));
  const min_y = Math.min(...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d)));
  const max_y = Math.max(...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d)));
  const x_range = max_x - min_x;
  const y_range = max_y - min_y;
  return [min_x - x_range*0.05, max_x + x_range*0.05, min_y - y_range*0.05, max_y + y_range*0.05];
}

function PlotScatterplot({y_feature, x_feature, patients_data, show_dash=false}: ScatterplotProps) {
  console.log("Scatterplot fun started");

  let [min_x, max_x, min_y, max_y] = calcMinMax({y_feature, x_feature, patients_data});
  console.log("--min max--");
  console.log(min_x);
  console.log(max_x);
  console.log(min_y);
  console.log(max_y);

  let slope: number = 0;
  let intercept: number = 0;
  [slope, intercept] = linReg(patients_data.map((p) => p[x_feature]), patients_data.map((p) => p[y_feature]));

  const linReg_x = [min_x, max_x];
  const linReg_y = linReg_x.map((x) => slope * x + intercept);
  const linRegData = linReg_x.map((x, i) => ({x: x, y: linReg_y[i]}));
  const pd_duration = Plot.plot({
    marks: [
      Plot.dot(patients_data, { x: x_feature, y: y_feature, tip: true }),
      Plot.line(linRegData, { x: "x", y: "y", stroke: "blue", strokeWidth: 2.5 }),
      Plot.crosshair(patients_data, { x: x_feature, y: y_feature, tip: true }),
      Plot.ruleY([min_y]),
      Plot.ruleX([min_x]),
      // Conditionally add the dashed line if show_dash is true
      ...(show_dash ? [Plot.ruleY([-1], {strokeDasharray: "3" })] : []),
    ],
    x: {
      label: x_feature,
      domain: [min_x, max_x],
    },
    y: {
      label: y_feature,
      domain: [min_y, max_y],
    },
    style: "--plot-background: black; "
  });

  const pd_duration_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (pd_duration_ref.current) {
    pd_duration_ref.current.innerHTML = ''; // Clear the div
    pd_duration_ref.current.appendChild(pd_duration);
    // histogramRef.current.appendChild(rand_histo);
  }

  return (
    <>
    <div className="flex-container">
      <div>
        <p> Scatterplot {y_feature}, slope={Math.round(slope * 1000) / 1000
        }</p>
        <div ref={pd_duration_ref}></div>
      </div>
    </div>
    </>
  );
}

function App() {
  // const [count, setCount] = useState<number>(0);
  const z_score_features: string[] = ["attent_z_comp", "exec_z_comp", "visuosp_z_comp", 
    "memory_z_comp", "language_z_comp"];
  const z_failed_tests = {
    "attent_z_comp": "attent_sum_z",
    "exec_z_comp": "exec_sum_z",
    "visuosp_z_comp": "visuosp_sum_z",
    "memory_z_comp": "memory_sum_z",
    "language_z_comp": "language_sum_z"
  }
  // const z_failed_tests_rel = {
  //   "attent_z_comp": "attent_sum_z",
  //   "exec_z_comp": "exec_sum_z",
  //   "visuosp_z_comp": "visuosp_sum_z",
  //   "memory_z_comp": "memory_sum_z",
  //   "language_z_comp": "language_sum_z"
  // }
  const [feature, setFeature] = useState<string>(z_score_features[0]);
  const feature_list: string[] = ["insnpsi_age", "attent_z_comp", "npsid_ddur_v", "attent_sum_z"
    , "attent_sum"];

  let emptyPatient: Patient = new Patient();
  const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54
  useEffect(() => {
    async function load() {
      let loaded = (await d3.csv("dataset/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
      setData(loaded);
    }
    load();
  }, []);


  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Parkinson's disease analysis</h1>
      <Michi patients_data={patients_data} selected_feature=""/>
      <label htmlFor="feature">Choose a feature:  </label>
      <select name="feature" id="feature" onChange={(e) => setFeature(e.target.value)}>
        {z_score_features.map((f) => <option value={f}>{f}</option>)}
      </select>
      <div className="flex-container">
        <PlotScatterplot y_feature={feature} x_feature='insnpsi_age' patients_data={patients_data} show_dash={true}/>
        <PlotScatterplot y_feature={feature} x_feature='npsid_ddur_v' patients_data={patients_data} show_dash={true}/>
      </div>
      <div className="flex-container">
        <PlotScatterplot y_feature={z_failed_tests[feature]} x_feature='insnpsi_age' patients_data={patients_data}/>
        <PlotScatterplot y_feature={z_failed_tests[feature]} x_feature='npsid_ddur_v' patients_data={patients_data} show_dash={true}/>
      </div>
      
    </>
  );
}

export default App;