import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ thêm dòng này
import { MovieProvider } from "./contexts/MovieContext";
import { ShowtimeProvider } from "./contexts/ShowtimeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { NewProvider } from "./contexts/NewsContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ShowtimeProvider>
          <MovieProvider>
            <NewProvider>
              <App />
            </NewProvider>
          </MovieProvider>
        </ShowtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
