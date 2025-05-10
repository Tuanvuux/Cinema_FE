import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import Badge from "./ui/badge";
import Button from "./ui/button";
import { Medal } from "lucide-react";
import { useMovies } from "../contexts/MovieContext";

const MovieList = () => {
  const navigate = useNavigate();
  const { movies, loading } = useMovies();
  const [activeTab, setActiveTab] = useState("nowShowing"); // nowShowing | comingSoon

  const now = new Date();

  // Phân loại phim
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
    <div>
      <div className="flex gap-4 mb-4 justify-center">
        <button
          className={`cursor-pointer px-6 py-2 rounded-full font-bold ${
            activeTab === "nowShowing"
              ? "bg-gray-900 text-white"
              : "border-2 border-gray-900 text-gray-900"
          }`}
          onClick={() => setActiveTab("nowShowing")}
        >
          PHIM ĐANG CHIẾU
        </button>
        <button
          className={`cursor-pointer px-6 py-2 rounded-full font-bold ${
            activeTab === "comingSoon"
              ? "bg-gray-900 text-white"
              : "border-2 border-gray-900 text-gray-900"
          }`}
          onClick={() => setActiveTab("comingSoon")}
        >
          PHIM SẮP CHIẾU
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-15">
        {displayedMovies.map((movie, index) => (
          <Card key={movie.movieId} className="relative group w-3xs">
            {index < 3 && activeTab === "nowShowing" && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white px-2 py-1 rounded-full shadow-md">
                <Medal
                  className={`w-5 h-5 ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-500"
                      : "text-orange-500"
                  }`}
                />
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
            )}

            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-72 object-cover rounded-t-lg"
            />

            <CardContent className="bg-white p-4 text-center text-gray-900">
              <h3 className="text-lg font-bold truncate">{movie.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                {movie.category?.name}
              </p>
              <p className="text-sm">
                {movie.duration} phút |{" "}
                <Badge variant="outline">{movie.ageLimit}</Badge>
              </p>
              <p className="text-sm text-gray-600">
                Khởi chiếu: {movie.releaseDate}
              </p>
              <Button
                className="mt-3 mr-2"
                onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
              >
                Chi tiết
              </Button>
              <Button
                className="mt-3 ml-2"
                onClick={() => navigate(`/showtime/${movie.movieId}`)}
              >
                Đặt Vé
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MovieList;
