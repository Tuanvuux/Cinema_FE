// src/contexts/MovieContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMovies } from "../services/api";

const MovieContext = createContext();

export const useMovies = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        // Lọc phim không bị xóa
        const filteredMovies = data.filter((movie) => movie.isDelete !== true);
        setMovies(filteredMovies);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <MovieContext.Provider value={{ movies, loading }}>
      {children}
    </MovieContext.Provider>
  );
};
