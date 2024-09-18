import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
// import * as obsPlot from "observablehq/plot";
import * as Plot from "@observablehq/plot";
import { Patient } from "./Patient";

function Michi(count: { counter: number; }) {
  console.log("Michi fun started");

  let x: number = 5;
  // const [data, setData] = useState(["leer"]);
  let emptyPatient: Patient = new Patient();
  const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54

  useEffect(() => {
    async function load() {
      let loaded = (await d3.csv("dataset/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
      setData(loaded);
    }
    load();
  }, []);
  console.log(patients_data);
  console.log(patients_data[0].record_id);
  console.log(patients_data.length);
  console.log("Michi patients data read");

  let total_age: number = 0;
  // patients_data.forEach((p) => {console.log(p.insnpsi_age);});
  patients_data.forEach((p) => {total_age += p.insnpsi_age;});

  let patients_age: number[] = [];
  patients_data.forEach((p) => {patients_age.push(p.insnpsi_age);});
  // console.log(patients_age);

  let patients_attent_z_comp: number[] = [];
  patients_data.forEach((p) => {patients_attent_z_comp.push(p.attent_z_comp);});
  // console.log(patients_attent_z_comp);

  // ----------------------------- scatterplot -----------------------------
  // useEffect(() => {
  //   const svg = d3.select("#scatterplot")
  //     .attr("width", 400)
  //     .attr("height", 400);

  //   const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  //   const width = +svg.attr("width") - margin.left - margin.right;
  //   const height = +svg.attr("height") - margin.top - margin.bottom;

  //   const x = d3
  //     .scaleLinear()
  //     .domain([d3.min(patients_age)-5, d3.max(patients_age)+5])
  //     .range([margin.left, width - margin.right]);

  //   const y = d3
  //     .scaleLinear()
  //     .domain([d3.min(patients_attent_z_comp), d3.max(patients_attent_z_comp)])
  //     .range([height - margin.bottom, margin.top]);

  //   const xAxis = (g) =>
  //     g
  //       .attr("transform", `translate(0,${height - margin.bottom})`)
  //       .call(d3.axisBottom(x))
  //       .call((g) => g.select(".domain").remove())
  //       .call((g) =>
  //         g
  //           .append("text")
  //           .attr("x", width - margin.right)
  //           .attr("y", -4)
  //           .attr("fill", "currentColor")
  //           .attr("font-weight", "bold")
  //           .attr("text-anchor", "end")
  //           .text("Age")
  //       );

  //   const yAxis = (g) =>
  //     g
  //       .attr("transform", `translate(${margin.left},0)`)
  //       .call(d3.axisLeft(y))
  //       .call((g) => g.select(".domain").remove())
  //       .call((g) =>
  //         g
  //           .append("text")
  //           .attr("x", 4)
  //           .attr("y", margin.top)
  //           .attr("dy", "0.32em")
  //           .attr("fill", "currentColor")
  //           .attr("font-weight", "bold")
  //           .attr("text-anchor", "start")
  //           .text("Attention Z Comp")
  //       );

  //   svg.append("g").call(xAxis);
  //   svg.append("g").call(yAxis);

  //   svg
  //     .append("g")
  //     .attr("fill", "steelblue")
  //     .selectAll("circle")
  //     .data(patients_data)
  //     .join("circle")
  //     .attr("cx", (d) => x(d.insnpsi_age))
  //     .attr("cy", (d) => y(d.attent_z_comp))
  //     .attr("r", 5);
  // }, [patients_data, patients_age, patients_attent_z_comp]);
  // ----------------------------- scatterplot -----------------------------
  console.log("d3 image created");

  // Obsverable plot

  const rand_histo = Plot.rectY({length: 10000}, Plot.binX({y: "count"}, {x: Math.random})).plot();
  const div = document.querySelector("#myplot");
  if (div) {
    console.log("div found");
    div.innerHTML = ''; // Clear the div
    div.appendChild(rand_histo);
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
      <h2>Welcome! x = {x}</h2>
      <h3>Patient: #{count.counter}</h3>
      <div>Daten: {patients_data[count.counter].toString()}</div>
      <p>Total age: {total_age}</p>
      <div className="flex-container">
        <div>
          <p>Histogram Obsverable</p>
          <div ref={histogramRef}></div> 
        </div>
        <div>
          <p>Random numbers, with div!</p>
          <div id="myplot"></div>
        </div>
      </div>
      <div className="flex-container">
        <div>
          <p>Scatterplot Obsverable</p>
          <div ref={scatterplot_ref}></div>
        </div>
      </div>
      <div className="flex-container">
        <div>
          <p>Duration PD vs z-score</p>
          <div ref={pd_duration_ref}></div>
        </div>
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
{/* <div id="myplot"></div> */}

function App() {
  const [count, setCount] = useState(0);

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
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      {/* <Michi /> */}
      <Michi counter={count} />
    </>
  );
}

export default App;


{/* <p>Scatterplot d3</p> 
<svg id="scatterplot"></svg> */}