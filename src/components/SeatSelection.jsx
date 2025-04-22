import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useShowtime } from "../contexts/ShowtimeContext";
import { getRoomById } from "../services/api";
import { getShowtimeById } from "../utils/showtimeUtils";

const SeatSelection = () => {
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showtimeId } = useParams();
  const { showtimes, loading } = useShowtime();

  // Sử dụng useRef để lưu trữ giá trị roomId đã tính toán
  const roomIdRef = useRef(null);

  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes);
  }, [showtimeId, showtimes]);

  const roomId = showtime?.room?.id ?? null;
  const movie = showtime?.movie ?? {};
  useEffect(() => {
    if (roomId !== roomIdRef.current) {
      roomIdRef.current = roomId; // Cập nhật lại giá trị roomId trong ref
    }
  }, [roomId]); // Chạy khi roomId thay đổi

  useEffect(() => {
    if (!roomId) return;

    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        const roomData = await getRoomById(roomId);
        const { numberOfRows, numberOfColumns, seats } = roomData;

        const rowLabels = Array.from(
          new Set(seats.map((seat) => seat.rowLabel))
        ).sort();

        const matrix = rowLabels.map((row) => {
          const rowSeats = Array(numberOfColumns).fill(null);
          seats
            .filter((seat) => seat.rowLabel === row)
            .forEach((seat) => {
              rowSeats[seat.columnNumber - 1] = seat;
            });
          return rowSeats;
        });

        setSeatMatrix(matrix);
      } catch (error) {
        console.error("Lỗi khi tải danh sách ghế:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [roomId]);

  const handleSelectSeat = (seatId) => {
    console.log("Select seat", seatId);
    // TODO: gửi chọn ghế qua WebSocket
  };

  const handleReleaseSeat = (seatId) => {
    console.log("Release seat", seatId);
    // TODO: gửi huỷ chọn ghế qua WebSocket
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center">
        <div className="spinner-border animate-spin w-8 h-8 border-t-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-2xl max-w-3xs">Chọn ghế</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Seat Selection Section */}
        <div>
          <div className="w-3/4 h-9 bg-red-300 text-center content-center m-auto">
            Màn hình
          </div>
          <div className="seat-container grid gap-4 mt-7">
            {seatMatrix.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="seat-row flex justify-center space-x-2"
              >
                {row.map((seat, colIndex) =>
                  seat ? (
                    <button
                      key={seat.seatId}
                      className={`
                        w-8 h-8 rounded-lg text-black border-2
                      ${
                        seat.status === "AVAILABLE"
                          ? "bg-white hover:bg-blue-900"
                          : "bg-black cursor-not-allowed"
                      }
                  ${seat.seatType === "COUPLE" ? "border-pink-400 w-16" : ""}
                      ${
                        seat.seatType == "VIP"
                          ? "border-yellow-300 w-8"
                          : "border-gray-300"
                      }
                    `}
                      onClick={() =>
                        seat.status === "AVAILABLE"
                          ? handleSelectSeat(seat.seatId)
                          : handleReleaseSeat(seat.seatId)
                      }
                      disabled={seat.status !== "AVAILABLE"}
                    >
                      {seat.seatName}
                    </button>
                  ) : (
                    <div key={colIndex} className="w-12 h-12" />
                  )
                )}
              </div>
            ))}
          </div>
          <div className="my-4">Chú thích: </div>
          <div className="flex items-start">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg border-2 border-gray-300"></div>
                <p className="m-0">Ghế thường</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg border-2 border-yellow-300"></div>
                <p className="m-0">Ghế VIP</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-black"></div>
                <p className="m-0">Ghế đã đặt</p>
              </div>
            </div>

            <div className="space-y-2 ml-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg border-2 bg-blue-900"></div>
                <p className="m-0">Ghế đang chọn</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg border-2 border-pink-400"></div>
                <p className="m-0">Ghế đôi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Information Section */}
        <div className="max-w-max bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl text-center">
            {movie.name} (T{movie.ageLimit})
          </h1>
          <div className="relative overflow-hidden rounded-lg mb-4">
            <img
              src={movie.posterUrl}
              alt={movie.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Thời lượng:</span>{" "}
              {movie.duration} phút
            </p>
            <p>
              <span className="font-semibold">Thể loại:</span>{" "}
              {movie.category?.name}
            </p>
            <p>
              <span className="font-semibold">Ngôn ngữ:</span> {movie.caption}
            </p>
            <p>
              <span className="font-semibold">Rated:</span> {movie.ageLimit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
