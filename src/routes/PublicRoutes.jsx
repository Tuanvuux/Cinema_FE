import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import MovieDetailPage from "../pages/public/MovieDetailPage";
import MoviePage from "../pages/public/MoviePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ShowTimePage from "../pages/public/ShowtimePage";
import UploadImageOnly from "@/pages/admin/UploadImageOnly.jsx";
import ExportToPNG from "@/pages/admin/ExportToPNG.jsx";

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movieDetail/:movieId" element={<MovieDetailPage />} />
      <Route path="/movie" element={<MoviePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
        <Route path="/addimage" element={<UploadImageOnly />} />
        <Route path="/loadPNG" element={<ExportToPNG />} />
      <Route path="/showtime/:movieId?" element={<ShowTimePage />} />
    </Routes>
  );
};

export default PublicRoutes;
