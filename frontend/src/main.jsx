// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // Your main App component that contains all routes
import "./index.css"; // Your global CSS file (ensure Tailwind directives are here)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
