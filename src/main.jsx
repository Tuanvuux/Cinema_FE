import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ thêm dòng này
import { MovieProvider } from "./contexts/MovieContext";
import { ShowtimeProvider } from "./contexts/ShowtimeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShowtimeProvider>
          <MovieProvider>
            <App />
          </MovieProvider>
        </ShowtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
