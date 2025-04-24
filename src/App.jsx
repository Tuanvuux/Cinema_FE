import { Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/PublicRoute";
import AdminRoutes from "./routes/AdminRoutes";

function App() {
    return (
        <Routes>
            {/* Public routes - tất cả đường dẫn chính */}
            <Route path="/*" element={<PublicRoute />} />

            {/* Admin routes - bắt đầu với /admin */}
            <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
    );
}

export default App;