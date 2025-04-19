import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/autoplay";
import { useMovies } from "../contexts/MovieContext";
export default function s() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const { movies, loading } = useMovies();

  if (loading) {
    return (
      <p className="text-center text-gray-500">Đang tải danh sách phim...</p>
    );
  }

  return (
    <div className=" bg-black w-full flex flex-col items-center">
      {/* Slider chính */}
      <Swiper
        modules={[Navigation, Thumbs, Autoplay]}
        navigation
        thumbs={{ swiper: thumbsSwiper }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="w-full max-w-4xl h-[400px]"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id}>
            <img
              src={movie.bannerUrl}
              alt="Movie"
              className="w-full h-full object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Slider nhỏ */}
      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView={5}
        spaceBetween={10}
        loop={true}
        loopAdditionalSlides={movies.length} // ✅ Fix lỗi kéo ngược
        loopedSlides={movies.length} // ✅ Đảm bảo lặp mượt
        className="w-full max-w-4xl mt-4"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.movieId} className="cursor-pointer">
            <img
              src={movie.bannerUrl}
              alt="Movie"
              className="w-full h-24 object-cover rounded-md opacity-70 hover:opacity-100 transition"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
