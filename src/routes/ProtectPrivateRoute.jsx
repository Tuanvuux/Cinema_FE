import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectPrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user || (user.role !== "ADMIN" && user.role !== "USER")) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectPrivateRoute;
