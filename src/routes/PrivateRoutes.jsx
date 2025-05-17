import { Routes, Route } from "react-router-dom";
import ProtectPrivateRoute from "./ProtectPrivateRoute.jsx";
import SeatSelectionPage from "../pages/private/SeatSelectionPage.jsx";
import PaymentPage from "../pages/private/PaymentPage.jsx";
import UserInfoPage from "../pages/private/UserInfoPage.jsx";
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
      <Route
        path="userInfo"
        element={
          <ProtectPrivateRoute>
            <UserInfoPage />
          </ProtectPrivateRoute>
        }
      />
    </Routes>
  );
};

export default PrivateRoutes;
