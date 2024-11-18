import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { DatabaseWorkerProvider } from "./providers/database-worker-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DatabaseWorkerProvider>
      <App />
    </DatabaseWorkerProvider>
  </StrictMode>,
);
