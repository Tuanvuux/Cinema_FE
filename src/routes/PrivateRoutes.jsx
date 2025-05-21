import { Routes, Route } from "react-router-dom";
import ProtectPrivateRoute from "./ProtectPrivateRoute.jsx";
import SeatSelectionPage from "../pages/private/SeatSelectionPage.jsx";
import PaymentPage from "../pages/private/PaymentPage.jsx";
import UserInfoPage from "../pages/private/UserInfoPage.jsx";
import PaymentSuccessPage from "../pages/private/PaymentSuccessPage.jsx";
import PaymentFailedPage from "../pages/private/PaymentFailedPage.jsx";
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
      <Route
        path="payment-success"
        element={
          <ProtectPrivateRoute>
            <PaymentSuccessPage />
          </ProtectPrivateRoute>
        }
      />
      <Route
        path="payment-failed"
        element={
          <ProtectPrivateRoute>
            <PaymentFailedPage />
          </ProtectPrivateRoute>
        }
      />
    </Routes>
  );
};

export default PrivateRoutes;
