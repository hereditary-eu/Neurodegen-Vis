import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";
import { Patient } from "./Patient";

function Michi(count: { counter: number; }) {
  console.log("Michi fun started");

  let x: number = 5;
  // const [data, setData] = useState(["leer"]);
  let emptyPatient: Patient = new Patient();
  const [patients_data, setData] = useState(Array(54).fill(emptyPatient)); // todo, hard coded 54

  useEffect(() => {
    async function load() {
      let loaded = (await d3.csv("/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
      setData(loaded);
    }
    load();
  }, []);
  console.log(patients_data);
  console.log(patients_data[0].record_id);
  console.log(patients_data.length);
  console.log("Michi fun ended");
  return (
    <>
      <h2>Welcome! x = {x}</h2>
      <h3>Patient: #{count.counter}</h3>
      <div>Daten: {patients_data[count.counter].toString()}</div>
    </>
  );
}

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
