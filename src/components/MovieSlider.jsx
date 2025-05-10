import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../contexts/MovieContext";

export default function MovieSlider() {
  const navigate = useNavigate();
  const { movies, loading } = useMovies();
  const [activeTab, setActiveTab] = useState("nowShowing");

  const now = new Date();

  const nowShowing = movies.filter(
    (movie) => new Date(movie.releaseDate) <= now
  );
  const comingSoon = movies.filter(
    (movie) => new Date(movie.releaseDate) > now
  );

  const displayedMovies = activeTab === "nowShowing" ? nowShowing : comingSoon;

  if (loading) {
    return (
      <p className="text-center text-gray-500">Đang tải danh sách phim...</p>
    );
  }

  return (
    <div className="w-full bg-white flex flex-col items-center px-4 my-5">
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab("nowShowing")}
          className={`cursor-pointer px-6 py-2 rounded-full font-bold ${
            activeTab === "nowShowing"
              ? "bg-gray-900 text-white"
              : "border-2 border-gray-900 text-gray-900"
          }`}
        >
          PHIM ĐANG CHIẾU
        </button>
        <button
          onClick={() => setActiveTab("comingSoon")}
          className={`cursor-pointer px-6 py-2 rounded-full font-bold ${
            activeTab === "comingSoon"
              ? "bg-gray-900 text-white"
              : "border-2 border-gray-900 text-gray-900"
          }`}
        >
          PHIM SẮP CHIẾU
        </button>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        slidesPerView={5}
        spaceBetween={20}
        className="w-full max-w-6xl"
      >
        {displayedMovies.map((movie) => (
          <SwiperSlide key={movie.movieId} className="relative">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-72 object-cover rounded-lg"
            />
            <div className="mt-2 text-center text-black">
              <p className="font-bold">{movie.name}</p>
              <p className="text-sm">
                {movie.duration} |{" "}
                <span className="text-green-400">{movie.ageLimit}</span>
              </p>
              <p className="text-sm">KHỞI CHIẾU {movie.releaseDate}</p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
                  className="cursor-pointer bg-white hover:bg-gray-900 hover:text-white text-gray-900 px-3 py-1 rounded-full text-sm border-1 border-gray-900"
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => navigate(`/showtime/${movie.movieId}`)}
                  className="cursor-pointer bg-white hover:bg-gray-900 hover:text-white text-gray-900 px-3 py-1 rounded-full text-sm border-1 border-gray-900"
                >
                  Đặt vé
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
