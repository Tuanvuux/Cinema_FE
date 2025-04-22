import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../contexts/MovieContext";
export default function MovieSlider() {
  const navigate = useNavigate(); // 👈 dùng navigate
  const { movies, loading } = useMovies();

  if (loading) {
    return (
      <p className="text-center text-gray-500">Đang tải danh sách phim...</p>
    );
  }
  return (
    <div className="w-full bg-black flex flex-col items-center px-4">
      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        <button className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold">
          PHIM ĐANG CHIẾU
        </button>
        <button className="border-2 border-white text-white px-6 py-2 rounded-full font-bold">
          PHIM SẮP CHIẾU
        </button>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        slidesPerView={4}
        spaceBetween={20}
        className="w-full max-w-5xl"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.movieId} className="relative">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-72 object-cover rounded-lg"
            />
            {/* Thông tin phim */}
            <div className="mt-2 text-center text-white">
              <p className="font-bold">{movie.name}</p>
              <p className="text-sm">
                {movie.duration} |{" "}
                <span className="text-green-400">{movie.ageLimit}</span>
              </p>
              <p className="text-sm">KHỞI CHIẾU {movie.releaseDate}</p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => navigate(`/showtime/${movie.movieId}`)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
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
