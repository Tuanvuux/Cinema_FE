import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMovieById } from "../services/api";

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(1);
        setMovie(data);
      } catch (err) {
        setError("Không thể tải dữ liệu phim.");
        console.error("Lỗi khi lấy phim:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  if (loading) return <p className="text-center">Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!movie) return <p className="text-center">Không tìm thấy phim.</p>;

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Nút đặt vé trên cùng */}
      <div className="flex justify-end">
        <button className="bg-[#0D1B2A] text-white px-6 py-2 rounded-lg font-bold">
          ĐẶT VÉ
        </button>
      </div>

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
          <p>
            <strong>Đạo diễn:</strong> {movie.director}
          </p>
          <p>
            <strong>Diễn viên:</strong> {movie.actor}
          </p>
          <p>
            <strong>Thể loại:</strong> {movie.category?.name}
          </p>
          <p>
            <strong>Khởi chiếu:</strong> {movie.releaseDate}
          </p>
          <p>
            <strong>Thời lượng:</strong> {movie.duration} phút
          </p>
          <p>
            <strong>Ngôn ngữ:</strong> {movie.caption}
          </p>
          <p className="text-red-600 font-bold">
            <strong>Rated:</strong> {movie.ageLimit}
          </p>

          {/* Nút hành động */}
          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold">
              Chi tiết
            </button>
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
            <button className="px-4 py-2 border border-gray-400 rounded-lg">
              Đánh giá
            </button>
          </div>
        </div>
      </div>

      {/* Mô tả phim */}
      <div className="mt-6 text-gray-700">{movie.description}</div>

      {/* Nút đặt vé ở cuối */}
      <div className="flex justify-center mt-6">
        <button className="bg-[#0D1B2A] text-white px-6 py-2 rounded-lg font-bold">
          ĐẶT VÉ
        </button>
      </div>
    </div>
  );
};

export default MovieDetailPage;
