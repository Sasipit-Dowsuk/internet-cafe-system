
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/login.css";
import "./styles/dashboard.css";
import "./styles/customers.css";
import "./styles/computers.css";
import "./styles/usage.css";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
