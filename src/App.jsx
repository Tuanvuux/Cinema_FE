import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/PublicRoute";
import HomePage from "./pages/public/HomePage";
import RegisterPage from "./pages/public/RegisterPage";
import Payment from "./components/Payment";
import SeatSelection from "./components/SeatSelection";
import MovieDetail from "./components/MovieDetail";
// import PrivateRoute from "./routes/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes cho user */}
        <Route path="/*" element={<PublicRoute />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/seat-selection" element={<SeatSelection />} />
        <Route path="/movie-detail" element={<MovieDetail />} />
      </Routes>
    </Router>
  );

}
