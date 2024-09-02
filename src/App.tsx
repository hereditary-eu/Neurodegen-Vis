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
  const [data, setData] = useState([emptyPatient]);

  useEffect(() => {
    async function load() {
      let loaded = (await d3.csv("/PD_SampleData_Curated.csv")).map((r) => Patient.fromJson(r));
      // setData(["hallo", "welt", "wie", "gehts"]);
      setData(loaded);
      // console.log(loaded);
      // console.log(data);
      // console.log(count);
      // console.log(count.counter);
    }
    load();
  }, []);
  console.log(data);
  console.log("Michi fun ended");
  return (
    <>
      <h2>Welcome! x = {x}</h2>
      <h3>Counter: {count.counter}</h3>
      <div>Daten: {data[0].toString()}</div>
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
