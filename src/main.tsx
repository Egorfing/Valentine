import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

const theme = createTheme({
  primaryColor: "pink",
  defaultRadius: "md",
  fontFamily: "\"Nunito\", system-ui, -apple-system, sans-serif"
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <HashRouter>
        <App />
      </HashRouter>
    </MantineProvider>
  </StrictMode>
);
