import { useEffect, useState } from "react";
import { getShowtimes } from "../services/api";
import { useNavigate } from "react-router-dom";

const getWeekday = (dateStr) => {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return days[new Date(dateStr).getDay()];
};

const Showtime = () => {
  const [showtimes, setShowtimes] = useState([]); // Đổi thành mảng thay vì đối tượng
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  const navigate = useNavigate();

  const handleSelectShowtime = (showtimeId) => {
    navigate(`/seats/${showtimeId}`);
  };

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const showtimeList = await getShowtimes();
        setShowtimes(showtimeList); // Đảm bảo dữ liệu là mảng
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  // Lọc ngày để chọn các ngày trong tuần
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split("T")[0];
  });

  const filteredShowtimes = showtimes.filter(
    (movie) =>
      Array.isArray(movie.showTimeList) &&
      movie.showTimeList.some((show) => show.showDate === selectedDate)
  );

  // Hàm để cắt bớt giây
  const formatTime = (time) => time.slice(0, 5); // Cắt bớt giây (giữ lại giờ và phút)

  return (
    <div className="p-6 bg-black">
      <h2 className="text-orange-500 text-2xl font-bold mb-4">Lịch chiếu</h2>

      {/* Chọn ngày */}
      <div className="bg-orange-50 border-t-2 border-orange-500 p-4 rounded-lg">
        <h3 className="text-lg text-black font-semibold mb-2">
          Chọn ngày chiếu
        </h3>
        <div className="flex space-x-4">
          {dates.map((date) => (
            <button
              key={date}
              className={`p-2 rounded-full w-10 h-10 text-white font-bold ${
                selectedDate === date ? "bg-orange-500" : "bg-gray-300"
              }`}
              onClick={() => setSelectedDate(date)}
            >
              {parseInt(date.split("-")[2])}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách phim */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white">Chọn lịch chiếu</h3>

        {loading ? (
          <p className="text-white mt-4">Đang tải lịch chiếu...</p>
        ) : filteredShowtimes.length > 0 ? (
          filteredShowtimes.map((movie, index) => (
            <div
              key={index}
              className="mt-4 flex space-x-4 bg-black rounded-lg p-4"
            >
              <img
                src={movie.posterUrl}
                alt={movie.movieName}
                className="w-24 h-36 object-cover rounded"
              />
              <div>
                <h4 className="font-bold">{movie.movieName}</h4>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Array.isArray(movie.showTimeList) &&
                    movie.showTimeList
                      .filter((show) => show.showDate === selectedDate)
                      .map((show, idx) => (
                        <button
                          className="bg-orange-500 text-white border border-white cursor-pointer"
                          key={show.showtimeId}
                          onClick={() => handleSelectShowtime(show.showtimeId)}
                        >
                          <div className="flex flex-col">
                            <div className="p-1">
                              {formatTime(show.startTime)} -{" "}
                              {formatTime(show.endTime)}
                            </div>
                            <div className="border-t border-white p-1 text-sm">
                              phòng chiếu:
                              <br /> {show.room.name}
                            </div>
                          </div>
                        </button>
                      ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mt-2">
            Ngày bạn chọn hiện không có lịch chiếu nào. Vui lòng chọn ngày khác.
          </p>
        )}
      </div>
    </div>
  );
};

export default Showtime;
