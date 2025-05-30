"use client"

import { useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import { useNavigate } from "react-router-dom"
import { useMovies } from "../contexts/MovieContext"
import { formatDate } from "../utils/helpers"
import { Loader2, Film } from "lucide-react"

export default function MovieSlider() {
    const navigate = useNavigate()
    const { movies, loading } = useMovies()
    const [activeTab, setActiveTab] = useState("nowShowing")

    const now = new Date()

    const nowShowing = movies.filter((movie) => new Date(movie.releaseDate) <= now)
    const comingSoon = movies.filter((movie) => new Date(movie.releaseDate) > now)

    const displayedMovies = activeTab === "nowShowing" ? nowShowing : comingSoon

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
                    <p className="text-gray-600 font-medium text-lg">Đang tải danh sách phim...</p>
                    <div className="flex space-x-1 mt-4">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white flex flex-col items-center px-4 my-5">
            {/* Tabs */}
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => setActiveTab("nowShowing")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                        activeTab === "nowShowing" ? "bg-gray-900 text-white" : "border-2 border-gray-900 text-gray-900"
                    }`}
                >
                    PHIM ĐANG CHIẾU
                </button>
                <button
                    onClick={() => setActiveTab("comingSoon")}
                    className={`cursor-pointer px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105 ${
                        activeTab === "comingSoon" ? "bg-gray-900 text-white" : "border-2 border-gray-900 text-gray-900"
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
                    <SwiperSlide key={movie.movieId} className="relative group">
                        <div className="overflow-hidden rounded-lg">
                            <img
                                src={movie.posterUrl || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-72 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <div className="mt-2 text-center text-black">
                            <p className="font-bold truncate w-full max-w-[200px] mx-auto transition-colors duration-300 group-hover:text-gray-700">
                                {movie.name}
                            </p>
                            <p className="text-sm">
                                {movie.duration} phút |{" "}
                                <span className={!movie.ageLimit ? "text-green-400 font-bold" : "text-red-500 font-bold"}>
                  {!movie.ageLimit ? "P" : "C" + movie.ageLimit}
                </span>
                            </p>
                            <p className="text-sm">KHỞI CHIẾU {formatDate(movie.releaseDate)}</p>
                            <div className="flex justify-center gap-2 mt-2 transform transition-all duration-300 group-hover:translate-y-[-2px]">
                                <button
                                    onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
                                    className="cursor-pointer bg-white hover:bg-gray-900 hover:text-white text-gray-900 px-3 py-1 rounded-full text-sm border-1 border-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-md"
                                >
                                    Chi tiết
                                </button>
                                <button
                                    onClick={() => navigate(`/showtime/${movie.movieId}`)}
                                    className="cursor-pointer bg-white hover:bg-gray-900 hover:text-white text-gray-900 px-3 py-1 rounded-full text-sm border-1 border-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-md"
                                >
                                    Đặt vé
                                </button>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    )
}
