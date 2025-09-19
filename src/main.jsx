import { ConfigProvider } from "antd";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#fe0808",
          colorBgBase: "#fff",
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);
