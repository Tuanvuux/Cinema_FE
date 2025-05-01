// src/App.jsx
import { Routes, Route } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import PrivateRoutes from "./routes/PrivateRoutes";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<PublicRoutes />} />
      <Route path="/user/*" element={<PrivateRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
    </Routes>
  );
}

export default App;
