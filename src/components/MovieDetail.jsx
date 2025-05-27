import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMovies } from "../contexts/MovieContext";
import { FaClock, FaRegCalendarAlt } from "react-icons/fa";
import { formatDate, ageLimit } from "../utils/helpers";

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movies, loading } = useMovies();

  useEffect(() => {
    if (!loading && movies.length > 0) {
      const foundMovie = movies.find(
        (m) => m.movieId === parseInt(movieId) // 👈 convert vì movieId trong URL là string
      );
      if (foundMovie) {
        setMovie(foundMovie);
      } else {
        setError("Không tìm thấy phim.");
      }
    }
  }, [loading, movies, movieId]);

  if (loading) return <p className="text-center">Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!movie) return <p className="text-center">Không tìm thấy phim.</p>;

  return (
    <div className="container p-6 bg-white shadow-md rounded-lg ml-10">
      {/* Nút đặt vé trên cùng */}

      {/* Thông tin chính */}
      <div className="flex flex-col md:flex-row items-center md:items-start mt-4">
        {/* Poster phim */}
        <img
          src={movie.posterUrl}
          alt={movie.name}
          className="w-64 h-auto rounded-lg shadow-lg"
        />

        {/* Thông tin phim */}
        <div className="md:ml-6 text-black w-full md:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900">{movie.name}</h2>
          <div className="flex font-bold">
            <div className="flex items-center gap-1 text-sm mr-10">
              <FaClock />
              <span>{movie.duration} phút</span>
            </div>
            <div className="flex items-center gap-1 text-sm ">
              <FaRegCalendarAlt />
              <span>{movie && formatDate(movie.releaseDate)}</span>
            </div>
          </div>
          <div
            className={
              !movie.ageLimit
                ? "text-green-400 font-bold"
                : "text-red-500 font-bold"
            }
          >
            {!movie.ageLimit ? "P" : "C" + movie.ageLimit + " "}
            <span className="text-black font-normal">
              {ageLimit(movie.ageLimit)}
            </span>
          </div>
          <p>
            <strong>Quốc gia:</strong> {movie.country}
          </p>
          <p>
            <strong>Thể loại:</strong> {movie.category?.name}
          </p>
          <p>
            <strong>Đạo diễn:</strong> {movie.director}
          </p>
          <p>
            <strong>Diễn viên:</strong> {movie.actor}
          </p>

          <p>
            <strong>Ngôn ngữ:</strong> {movie.caption}
          </p>

          {/* Nút hành động */}
          <div className="mt-4 flex space-x-2">
            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-400 rounded-lg"
              >
                Trailer
              </a>
            )}
            <div className="">
              <button
                className="bg-[#0D1B2A] text-white px-6 py-2 rounded-lg font-bold"
                onClick={() => navigate(`/showtime/${movie.movieId}`)}
              >
                ĐẶT VÉ
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 text-gray-700">{movie.description}</div>
    </div>
  );
};

export default MovieDetailPage;
