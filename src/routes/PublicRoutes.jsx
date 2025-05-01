import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import MovieDetailPage from "../pages/public/MovieDetailPage";
import MoviePage from "../pages/public/MoviePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ShowTimePage from "../pages/public/ShowtimePage";
const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movieDetail/:movieId" element={<MovieDetailPage />} />
      <Route path="/movie" element={<MoviePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/showtime" element={<ShowTimePage />} />
    </Routes>
  );
};

export default PublicRoutes;
