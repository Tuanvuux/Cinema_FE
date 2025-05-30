"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "./ui/card"
import Button from "./ui/button"
import { Film, Loader2, Medal } from "lucide-react"
import { useMovies } from "../contexts/MovieContext"
import { formatDate } from "../utils/helpers"

const MovieList = () => {
    const navigate = useNavigate()
    const { movies, loading } = useMovies()
    const [activeTab, setActiveTab] = useState("nowShowing") // nowShowing | comingSoon

    const now = new Date()

    // Phân loại phim
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
            {/* Tab buttons - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center items-center">
                <button
                    className={`w-full sm:w-auto cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${
                        activeTab === "nowShowing" ? "bg-gray-900 text-white shadow-lg" : "border-2 border-gray-900 text-gray-900"
                    }`}
                    onClick={() => setActiveTab("nowShowing")}
                >
                    PHIM ĐANG CHIẾU
                </button>
                <button
                    className={`w-full sm:w-auto cursor-pointer px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 ${
                        activeTab === "comingSoon" ? "bg-gray-900 text-white shadow-lg" : "border-2 border-gray-900 text-gray-900"
                    }`}
                    onClick={() => setActiveTab("comingSoon")}
                >
                    PHIM SẮP CHIẾU
                </button>
            </div>

            {/* Movie grid - Fully responsive */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {displayedMovies.map((movie, index) => (
                    <Card
                        key={movie.movieId}
                        className="relative group w-full transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-white rounded-lg overflow-hidden"
                    >
                        {/* Ranking badge - Only show on larger screens for top 3 */}
                        {index < 3 && activeTab === "nowShowing" && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md z-10 transition-all duration-300 group-hover:scale-110">
                                <Medal
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                        index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-500" : "text-orange-500"
                                    }`}
                                />
                                <span className="text-xs sm:text-sm font-bold">{index + 1}</span>
                            </div>
                        )}

                        {/* Movie poster */}
                        <div className="overflow-hidden">
                            <img
                                src={movie.posterUrl || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>

                        {/* Movie info */}
                        <CardContent className="bg-white p-3 sm:p-4 text-center text-gray-900">
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold truncate transition-colors duration-300 group-hover:text-gray-700 mb-1 sm:mb-2">
                                {movie.name}
                            </h3>

                            <p className="text-xs sm:text-sm text-gray-500 truncate mb-1">{movie.category?.name}</p>

                            <p className="text-xs sm:text-sm mb-1 sm:mb-2">
                                {movie.duration} phút |{" "}
                                <span className={!movie.ageLimit ? "text-green-400 font-bold" : "text-red-500 font-bold"}>
                  {!movie.ageLimit ? "P" : "C" + movie.ageLimit}
                </span>
                            </p>

                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                                Khởi chiếu: {formatDate(movie.releaseDate)}
                            </p>

                            {/* Action buttons - Responsive layout */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 transform transition-all duration-300 group-hover:translate-y-[-2px] justify-center">
                                <Button
                                    className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transition-all duration-300 hover:shadow-md"
                                    onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
                                >
                                    Chi tiết
                                </Button>
                                <Button
                                    className="w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 transition-all duration-300 hover:shadow-md"
                                    onClick={() => navigate(`/showtime/${movie.movieId}`)}
                                >
                                    Đặt Vé
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {displayedMovies.length === 0 && (
                <div className="text-center py-12 sm:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Film className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Không có phim nào</h3>
                    <p className="text-sm sm:text-base text-gray-500">
                        {activeTab === "nowShowing"
                            ? "Hiện tại không có phim nào đang chiếu"
                            : "Hiện tại không có phim nào sắp chiếu"}
                    </p>
                </div>
            )}
        </div>
    )
}

export default MovieList
