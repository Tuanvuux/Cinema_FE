import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 import navigate
import { Card, CardContent } from "./ui/card";
import Badge from "./ui/badge";
import Button from "./ui/button";
import { Medal } from "lucide-react";
import { getMovies } from "../services/api";
import { useMovies } from "../contexts/MovieContext";
const MovieList = () => {
  const navigate = useNavigate(); // 👈 dùng navigate
  const { movies, loading } = useMovies();
  if (loading) {
    return (
      <p className="text-center text-gray-500">Đang tải danh sách phim...</p>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-4 justify-center">
        <button className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold">
          PHIM ĐANG CHIẾU
        </button>
        <button className="border-2 border-gray-900 text-gray-900 px-6 py-2 rounded-full font-bold">
          PHIM SẮP CHIẾU
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-15">
        {movies.map((movie, index) => (
          <Card key={movie.movieId} className="relative group w-3xs">
            {index < 3 && (
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
                className="mt-3 mr-2 "
                onClick={() => navigate(`/movieDetail/${movie.movieId}`)}
              >
                Chi tiết
              </Button>
              <Button
                className="mt-3 ml-2"
                onClick={() => navigate(`/showtime/${movie.movieId}`)} // 👈 điều hướng
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
