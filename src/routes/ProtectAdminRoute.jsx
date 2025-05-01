// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectAdminRoute;
