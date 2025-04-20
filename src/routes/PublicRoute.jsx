import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import MovieDetailPage from "../pages/public/MovieDetailPage";
import MoviePage from "../pages/public/MoviePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ShowTimePage from "../pages/public/ShowtimePage";
import SeatSelectionPage from "../pages/public/SeatSelectionPage";
import PaymentPage from "../pages/public/PaymentPage";
const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movieDetail/:movieId" element={<MovieDetailPage />} />
      <Route path="/movie" element={<MoviePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/showtime" element={<ShowTimePage />} />
      <Route path="/showtime/:movieId" element={<ShowTimePage />} />
      <Route path="/seats/:showtimeId" element={<SeatSelectionPage />} />
      <Route path="/payment" element={<PaymentPage />} />
    </Routes>
  );
};

export default PublicRoute;
