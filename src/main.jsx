import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ thêm dòng này

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {" "}
      {/* ✅ bọc App bằng BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>
);
