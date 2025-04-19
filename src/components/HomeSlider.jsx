import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/autoplay";

const movies = [
  {
    id: 1,
    img: "https://cdn-www.vinid.net/6c2efa0b-phim-hoat-hinh-chieu-rap.jpg",
  },
  {
    id: 2,
    img: "https://cdn-images.vtv.vn/2022/12/28/poster-mbsd-16722023097352086945880.jpg",
  },
  {
    id: 3,
    img: "https://cdn.nguyenkimmall.com/images/detailed/740/phim-bo-gia-tran-thanh-viet-nam.jpg",
  },
  {
    id: 4,
    img: "https://cdn-www.vinid.net/6c2efa0b-phim-hoat-hinh-chieu-rap.jpg",
  },
  {
    id: 5,
    img: "https://cdn-images.vtv.vn/2022/12/28/poster-mbsd-16722023097352086945880.jpg",
  },
  {
    id: 6,
    img: "https://cdn.nguyenkimmall.com/images/detailed/740/phim-bo-gia-tran-thanh-viet-nam.jpg",
  },
];

export default function s() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

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
              src={movie.img}
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
          <SwiperSlide key={movie.id} className="cursor-pointer">
            <img
              src={movie.img}
              alt="Movie"
              className="w-full h-24 object-cover rounded-md opacity-70 hover:opacity-100 transition"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
