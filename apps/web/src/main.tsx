import App from "./App.tsx";
// import { mountAppInfo } from './helpers/appInfo';
import "./index.css";
// import { DEBUG_MODE } from '@zjp-web/conf/env';
// import { setupExtension } from '@zjp-web/i18n';
// import 'animate.css';
import React from "react";
import ReactDOM from "react-dom/client";

// if (DEBUG_MODE) {
//   setupExtension();
// }

// registerSW();

// initFirebase();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
