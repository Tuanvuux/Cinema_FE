import { Routes, Route } from "react-router-dom";
import ProtectPrivateRoute from "./ProtectPrivateRoute.jsx";
import SeatSelectionPage from "../pages/public/SeatSelectionPage";
import PaymentPage from "../pages/public/PaymentPage";

const PrivateRoutes = () => {
  return (
    <Routes>
      <Route
        path="seats/:showtimeId"
        element={
          <ProtectPrivateRoute>
            <SeatSelectionPage />
          </ProtectPrivateRoute>
        }
      />
      <Route
        path="payment"
        element={
          <ProtectPrivateRoute>
            <PaymentPage />
          </ProtectPrivateRoute>
        }
      />
    </Routes>
  );
};

export default PrivateRoutes;
