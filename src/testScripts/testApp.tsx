// import { useState } from "react";
// import { Collapse, Button } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./testApp.css";
// Sidebar.tsx
import React, { useState } from "react";

const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <button onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? ">>" : "<<"}
            </button>
            {!collapsed && (
                <ul>
                    <li>Home</li>
                    <li>Profile</li>
                    <li>Settings</li>
                </ul>
            )}
        </div>
    );
};

function TestApp() {
    return (
        <>
            Hello world
            <Sidebar />
        </>
    );
}

export default TestApp;
