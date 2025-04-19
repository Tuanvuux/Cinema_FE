import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const movies = [
  {
    id: 1,
    title: "Emma và Vương Quốc...",
    duration: "80 PHÚT",
    age: "P",
    release: "07-03-2025",
    img: "https://cdn-www.vinid.net/6c2efa0b-phim-hoat-hinh-chieu-rap.jpg",
  },
  {
    id: 2,
    title: "Quỷ Nhập Tràng (T18)",
    duration: "120 PHÚT",
    age: "C18",
    release: "05-03-2025",
    img: "https://cdn-images.vtv.vn/2022/12/28/poster-mbsd-16722023097352086945880.jpg",
  },
  {
    id: 3,
    title: "Nhà Gia Tiên (T18)",
    duration: "117 PHÚT",
    age: "C18",
    release: "21-02-2025",
    img: "https://cdn.nguyenkimmall.com/images/detailed/740/phim-bo-gia-tran-thanh-viet-nam.jpg",
  },
  {
    id: 4,
    title: "(Lồng tiếng) Sát T...",
    duration: "107 PHÚT",
    age: "C16",
    release: "12-03-2025",
    img: "https://cdn-www.vinid.net/6c2efa0b-phim-hoat-hinh-chieu-rap.jpg",
  },
  {
    id: 5,
    title: "Người Kiến và Ong...",
    duration: "125 PHÚT",
    age: "C16",
    release: "14-03-2025",
    img: "https://cdn-images.vtv.vn/2022/12/28/poster-mbsd-16722023097352086945880.jpg",
  },
];

export default function MovieSlider() {
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
          <SwiperSlide key={movie.id} className="relative">
            <img
              src={movie.img}
              alt={movie.title}
              className="w-full h-72 object-cover rounded-lg"
            />
            {/* Thông tin phim */}
            <div className="mt-2 text-center text-white">
              <p className="font-bold">{movie.title}</p>
              <p className="text-sm">
                {movie.duration} |{" "}
                <span className="text-green-400">{movie.age}</span>
              </p>
              <p className="text-sm">KHỞI CHIẾU {movie.release}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
