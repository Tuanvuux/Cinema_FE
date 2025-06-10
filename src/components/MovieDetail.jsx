"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMovies } from "../contexts/MovieContext";
import {
  Clock,
  Calendar,
  MapPin,
  User,
  Users,
  Globe,
  Play,
  Ticket,
  AlertCircle,
  Film,
  Bookmark
} from "lucide-react";
import { formatDate, ageLimit } from "../utils/helpers";

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const navigate = useNavigate();
  const { movies, loading } = useMovies();

  useEffect(() => {
    if (!loading && movies.length > 0) {
      const foundMovie = movies.find(
        (m) => m.movieId === Number.parseInt(movieId) // 👈 convert vì movieId trong URL là string
      );
      if (foundMovie) {
        setMovie(foundMovie);
      } else {
        setError("Không tìm thấy phim.");
      }
    }
  }, [loading, movies, movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-gray-900 rounded-full"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-900 rounded-full"></div>
          </div>

          {/* Loading animation */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6 shadow-lg relative">
              <Film className="w-10 h-10 text-white" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-300 animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Đang tải thông tin phim
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Vui lòng đợi trong giây lát...
            </p>

            {/* Loading progress dots */}
            <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500 rounded-full"></div>
          </div>

          {/* Error content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Không tìm thấy phim
            </h3>
            <p className="text-red-600 font-medium text-center mb-6">{error}</p>

            <div className="flex space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Quay lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Film className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Không tìm thấy phim
          </h3>
          <p className="text-gray-500 text-center mb-6">
            Phim bạn tìm kiếm không tồn tại
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Film className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold">Chi tiết phim</h1>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Movie poster */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  <img
                    src={movie.posterUrl || "/placeholder.svg"}
                    alt={movie.name}
                    className="w-full h-auto rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
              </div>

              {/* Movie information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and basic info */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {movie.name}
                  </h2>

                  {/* Age rating badge - moved to top */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold shadow-lg ${
                        !movie.ageLimit
                          ? "bg-green-100 text-green-600 border-2 border-green-300"
                          : "bg-red-100 text-red-600 border-2 border-red-300"
                      }`}
                    >
                      {!movie.ageLimit ? "P" : "C" + movie.ageLimit}
                    </div>
                    <span className="ml-3 font-semibold text-gray-700 text-lg">
                      {ageLimit(movie.ageLimit)}
                    </span>
                  </div>

                  {/* Quick info cards - remove age rating from here */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {movie.duration} phút
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      <span className="font-medium text-gray-700">
                        {formatDate(movie.releaseDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed information */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-700">Quốc gia</p>
                        <p className="text-gray-600">{movie.country}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="h-5 w-5 bg-gray-500 rounded-sm mt-0.5 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">Thể loại</p>
                        <p className="text-gray-600">{movie.category?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-700">Đạo diễn</p>
                        <p className="text-gray-600">{movie.director}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-700">Diễn viên</p>
                        <p className="text-gray-600">{movie.actor}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <Bookmark  className="h-5 w-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-700">Chú thích</p>
                        <p className="text-gray-600">{movie.caption}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {movie.trailerUrl && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      XEM TRAILER
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/showtime/${movie.movieId}`)}
                    className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-bold hover:from-gray-800 hover:to-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    ĐẶT VÉ NGAY
                  </button>
                </div>
              </div>
            </div>

            {/* Trailer section */}
            {movie.trailerUrl && showTrailer && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Play className="h-6 w-6 mr-3 text-red-600" />
                    Trailer phim
                  </h3>
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors duration-200"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <div className="relative" style={{ paddingBottom: "56.25%" }}>
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      controls
                      autoPlay
                      src={movie.trailerUrl}
                    >
                      Trình duyệt của bạn không hỗ trợ video HTML5.
                    </video>
                  </div>
                </div>
              </div>
            )}

            {/* Movie description */}
            {movie.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Nội dung phim
                </h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {movie.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
