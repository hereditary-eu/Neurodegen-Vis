import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./css/index.css";
import Test from "./testApp.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
        {/* <Test /> */}
    </StrictMode>
);
