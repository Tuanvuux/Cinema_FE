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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {movies.map((movie, index) => (
        <Card key={movie.movieId} className="relative group">
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

          <CardContent className="bg-black p-4 text-center text-white">
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
              className="mt-3 w-full"
              onClick={() => navigate(`/showtime/${movie.movieId}`)} // 👈 điều hướng
            >
              Đặt Vé
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MovieList;
