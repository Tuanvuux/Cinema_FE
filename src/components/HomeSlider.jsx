import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/autoplay";
import { useMovies } from "../contexts/MovieContext";
import { useNavigate } from "react-router-dom";
import { Film, Loader2 } from "lucide-react";

export default function MovieBannerSlider() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const { movies, loading } = useMovies();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-full bg-white flex flex-col items-center px-4 my-5">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Film className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-gray-600 animate-spin" />
          </div>
          <p className="text-gray-600 font-medium text-lg">
            Đang tải danh sách phim...
          </p>
          <div className="flex space-x-1 mt-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  const movieDetailPage = (movieId) => {
    navigate(`/movieDetail/${movieId}`);
  };

  return (
    <div className="bg-white w-full flex flex-col items-center mt-5">
      {/* Main Slider */}
      <div className="w-full max-w-6xl relative group">
        <Swiper
          modules={[Navigation, Thumbs, Autoplay]}
          navigation
          thumbs={{ swiper: thumbsSwiper }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop
          className="w-full h-[500px] rounded-lg overflow-hidden shadow-xl"
        >
          {movies.map((movie) => (
            <SwiperSlide
              key={movie.movieId}
              className="relative group cursor-pointer"
              onClick={() => movieDetailPage(movie.movieId)}
            >
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={movie.bannerUrl || "/placeholder.svg"}
                  alt="Movie"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Movie info overlay */}
                <div className="absolute bottom-4 left-4 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                    {movie.name}
                  </h3>
                  <p className="text-sm drop-shadow-md">
                    {movie.category?.name}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail Slider */}
      <div className="w-full max-w-6xl mt-4">
        <Swiper
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          loop={true}
          className="w-full"
          // Add responsive breakpoints here for the thumbnail slider
          breakpoints={{
            // When window width is >= 320px
            320: {
              slidesPerView: 2,
              spaceBetween: 5,
            },
            // When window width is >= 480px
            480: {
              slidesPerView: 3,
              spaceBetween: 8,
            },
            // When window width is >= 768px
            768: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
            // When window width is >= 1024px
            1024: {
              slidesPerView: 5,
              spaceBetween: 10,
            },
            // When window width is >= 1280px
            1280: {
              slidesPerView: 5, // Keep 5 for large screens as per original
              spaceBetween: 10,
            },
          }}
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.movieId} className="cursor-pointer group">
              <div className="relative overflow-hidden rounded-md">
                <img
                  src={movie.bannerUrl || "/placeholder.svg"}
                  alt="Movie"
                  className="w-full h-28 object-cover opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Active indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
