import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
// import * as obsPlot from "observablehq/plot";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";

interface MichiProps {
  count: number;
  patients_data: Patient[];
  selected_feature: string;
}

function Michi({count, patients_data, selected_feature}: MichiProps) {

  console.log("Michi fun started");
  let binNumber = 8;

  console.log(patients_data);
  console.log(patients_data[0].record_id);
  console.log(patients_data.length);
  console.log("Michi patients data read");

  let total_age: number = 0;
  // patients_data.forEach((p) => {console.log(p.insnpsi_age);});
  patients_data.forEach((p) => {total_age += p.insnpsi_age;});

  let patients_age: number[] = [];
  patients_data.forEach((p) => {patients_age.push(p.insnpsi_age);});

  let patients_attent_z_comp: number[] = [];
  patients_data.forEach((p) => {patients_attent_z_comp.push(p.attent_z_comp);});
  // console.log(patients_attent_z_comp);

  // ----------------------------- scatterplot -----------------------------
  console.log("d3 image created");

  // Obsverable plot

  // const rand_histo = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
  const dur_histo = Plot.plot({
    marks: [
      // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
      Plot.rectY(patients_data, Plot.binX({y: "count", thresholds: 8}, {x: "npsid_ddur_v"})),
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
  const div = document.querySelector("#myplot");
  if (div) {
    console.log("div found");
    div.innerHTML = ''; // Clear the div
    div.appendChild(dur_histo);
  }
  else {
    console.log("div not found");
  }

  const age_histo = Plot.plot({
    marks: [
      // Plot.rectY(patients_age, Plot.binX({y: "count"}, {x: d => d})),
      Plot.rectY(patients_data, Plot.binX({y: "count", thresholds: 7}, {x: "insnpsi_age"})),
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
  const histogramRef = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (histogramRef.current) {
    histogramRef.current.innerHTML = ''; // Clear the div
    histogramRef.current.appendChild(age_histo);
    // histogramRef.current.appendChild(rand_histo);
  }

  const basic_scatterplot = Plot.plot({
    marks: [
      Plot.dot(patients_data, {x: "insnpsi_age", y: "attent_z_comp"}),
      Plot.ruleX([Math.min(...patients_age.filter((d) => !isNaN(d)))-1]),
      Plot.ruleY([Math.min(...patients_attent_z_comp.filter((d) => !isNaN(d)))]),
      Plot.ruleY([-1])
    ],
    x: {
      label: "Age",
      // tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Attention Z Comp",
    },
  });

  const scatterplot_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (scatterplot_ref.current) {
    scatterplot_ref.current.innerHTML = ''; // Clear the div
    scatterplot_ref.current.appendChild(basic_scatterplot);
    // histogramRef.current.appendChild(rand_histo);
  } 

  const pd_duration = Plot.plot({
    marks: [
      Plot.dot(patients_data, {x: "npsid_ddur_v", y: "attent_z_comp"}),
      // Plot.ruleX([Math.min(...patients_age.filter((d) => !isNaN(d)))-1]),
      Plot.ruleY([-1]),
    ],
    x: {
      label: "Duration PD",
      // tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Attention Z Comp",
    },
  });

  const pd_duration_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (pd_duration_ref.current) {
    pd_duration_ref.current.innerHTML = ''; // Clear the div
    pd_duration_ref.current.appendChild(pd_duration);
    // histogramRef.current.appendChild(rand_histo);
  }

  const failed_tests = Plot.plot({
    marks: [
      Plot.dot(patients_data, {x: "npsid_ddur_v", y: 'attent_sum_z'}),
      // Plot.ruleX([Math.min(...patients_age.filter((d) => !isNaN(d)))-1]),
      Plot.ruleY([0]),
    ],
    x: {
      label: "Duration PD",
      // tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Attention Z Comp",
    },
  });

  const failed_tests_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (failed_tests_ref.current) {
    failed_tests_ref.current.innerHTML = ''; // Clear the div
    failed_tests_ref.current.appendChild(failed_tests);
    // histogramRef.current.appendChild(rand_histo);
  }

  const failed_tests_rel = Plot.plot({
    marks: [
      Plot.dot(patients_data, {x: "npsid_ddur_v", y: (d) => d.attent_sum_z / d.attent_sum}),
      Plot.ruleY([0]),

      // Plot.ruleX([Math.min(...patients_age.filter((d) => !isNaN(d)))-1]),
    ],
    x: {
      label: "Duration PD",
      // tickFormat: (d: number) => d.toString(),
    },
    y: {
      label: "Attention Z Comp",
    },
  });

  const failed_tests_rel_ref = useRef<HTMLDivElement>(null);  // Create a ref to access the div element
  if (failed_tests_rel_ref.current) {
    failed_tests_rel_ref.current.innerHTML = ''; // Clear the div
    failed_tests_rel_ref.current.appendChild(failed_tests_rel);
    // histogramRef.current.appendChild(rand_histo);
  }

  console.log("obs plot created");
  // console.log(plot);
  // console.log(age_histo);
  // console.log(div);
  // console.log(svg)
  // div.append(histogram);
  // console.log(div)
  return (
    <>
      <div className="flex-container">
        <div>
          <p>Age Distribution</p>
          <div ref={histogramRef}></div> 
        </div>
        <div>
          <p>Time since PD diagnosis Distribution</p>
          <div id="myplot"></div>
        </div>
      </div>
      <div className="flex-container">
        <div>
          <p>Age vs attention z-score</p>
          <div ref={scatterplot_ref}></div>
        </div>
        <div>
          <p>Duration PD vs z-score</p>
          <div ref={pd_duration_ref}></div>
        </div>
      </div>
      <div className="flex-container">

      </div>
      <div className="flex-container">
      <div>
          <p>Duration PD vs failed tests</p>
          <div ref={failed_tests_ref}></div>
        </div>
        <div>
          <p>Duration PD vs failed tests relativ</p>
          <div ref={failed_tests_rel_ref}></div>
        </div>
      </div>
    </>
  );
}

interface ScatterplotProps {
  feature: string;
  patients_data: Patient[];
}


function linReg(xArray: number[], yArray: number[]): [number, number] {
  // Calculate Sums
  console.log("linReg fun started");
  console.log(xArray);
  console.log(yArray);
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


function PlotScatterplot({feature, patients_data}: ScatterplotProps) {
  console.log("Scatterplot fun started");
  console.log(patients_data);

  let slope: number = 0;
  let intercept: number = 0;
  [slope, intercept] = linReg(patients_data.map((p) => p.npsid_ddur_v), patients_data.map((p) => p[feature]));
  console.log(slope);
  console.log(intercept);

  // const linReg_x = [Math.min(...patients_data.map((p) => p.npsid_ddur_v)),
  //    Math.max(...patients_data.map((p) => p.npsid_ddur_v))];
  const linReg_x = [0, 10, 25];
  const linReg_y = linReg_x.map((x) => slope * x + intercept);
  console.log(linReg_x);
  console.log(linReg_y);
  const linRegData = linReg_x.map((x, i) => ({x: x, y: linReg_y[i]}));
  // throw TypeError("test");

  const pd_duration = Plot.plot({
    marks: [
      Plot.dot(patients_data, { x: "npsid_ddur_v", y: feature, tip: true }),
      Plot.line(linRegData, {x: "x", y: "y", stroke: "blue"}),
      // Plot.crosshair(olympians, {x: "weight", y: "height"})
    ],
    x: {
      label: "Duration PD",
    },
    y: {
      label: feature,
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
  <div className="flex-container">
    <div>
      <p> Scatterplot {feature}, slope={slope}</p>
      <div ref={pd_duration_ref}></div>
    </div>
  </div>
  );
}

function App() {
  const [count, setCount] = useState<number>(0);
  const [feature, setFeature] = useState<string>("insnpsi_age");
  const z_score_features: string[] = ["attent_z_comp", "exec_z_comp", "visuosp_z_comp", 
    "memory_z_comp", "language_z_comp"];
  const feature_list: string[] = ["insnpsi_age", "attent_z_comp", "npsid_ddur_v", "attent_sum_z"
    , "attent_sum"];

  let emptyPatient: Patient = new Patient();
  const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54
  console.log(patients_data);

  useEffect(() => {
    async function load() {
      let loaded = (await d3.csv("dataset/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
      setData(loaded);
    }
    load();
  }, []);
  console.log("after")
  console.log(patients_data);

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
      <Michi count={count} patients_data={patients_data} selected_feature=""/>
      <label htmlFor="feature">Choose a feature:  </label>
      <select name="feature" id="feature" onChange={(e) => setFeature(e.target.value)}>
        {z_score_features.map((f) => <option value={f}>{f}</option>)}
      </select>
      <PlotScatterplot feature={feature} patients_data={patients_data}/>
    </>
  );
}

export default App;