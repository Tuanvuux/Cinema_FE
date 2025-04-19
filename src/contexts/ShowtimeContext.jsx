// src/contexts/MovieContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getShowtimes } from "../services/api";

const ShowtimeContext = createContext();

export const useShowtime = () => useContext(ShowtimeContext);

export const ShowtimeProvider = ({ children }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const data = await getShowtimes(); // chỉ gọi 1 lần duy nhất
        setShowtimes(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  return (
    <ShowtimeContext.Provider value={{ showtimes, loading }}>
      {children}
    </ShowtimeContext.Provider>
  );
};
