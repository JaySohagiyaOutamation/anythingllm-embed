import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { parseStylesSrc } from "./utils/constants.js";
const appElement = document.createElement("div");

document.body.appendChild(appElement);
const root = ReactDOM.createRoot(appElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const scriptSettings = Object.assign(
  {},
  document?.currentScript?.dataset || {}
);
export const embedderSettings = {
  settings: scriptSettings,
  stylesSrc: parseStylesSrc(document?.currentScript?.src),
  USER_STYLES: {
    base: `allm-text-black allm-mr-[37px] allm-ml-[9px]`,
  },
  ASSISTANT_STYLES: {
    base: `allm-text-black allm-mr-[37px] allm-ml-[9px]`,
    msgBg: "#ffffff",
  },
};
