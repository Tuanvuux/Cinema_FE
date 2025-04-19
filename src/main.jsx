import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ thêm dòng này
import { MovieProvider } from "./contexts/MovieContext";
import { ShowtimeProvider } from "./contexts/ShowtimeContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ShowtimeProvider>
        <MovieProvider>
          <App />
        </MovieProvider>
      </ShowtimeProvider>
    </BrowserRouter>
  </StrictMode>
);
