import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/public/HomePage";
import MovieDetailPage from "../pages/public/MovieDetailPage";
import MoviePage from "../pages/public/MoviePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import ShowTimePage from "../pages/public/ShowtimePage";
import UploadImageOnly from "@/pages/admin/UploadImageOnly.jsx";
import ExportToPNG from "@/pages/admin/ExportToPNG.jsx";
import ForgotPasswordPage from "../pages/public/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/public/ResetPasswordPage.jsx";
import NewsPage from "../pages/public/NewPage.jsx";
import NewsDetailPage from "../pages/public/NewsDetailPage.jsx";

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
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/news/:postId" element={<NewsDetailPage />} />
    </Routes>
  );
};

export default PublicRoutes;
