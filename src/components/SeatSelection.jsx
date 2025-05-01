import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShowtime } from "../contexts/ShowtimeContext";
import { getRoomById, getSeatsLock } from "../services/api";
import { getShowtimeById } from "../utils/showtimeUtils";
import useSeatSocket from "../hooks/useSeatSocket"; // Import hook WebSocket
import MovieInfo from "./MovieInfo";
import SeatLegend from "./SeatLegend";

const SeatSelection = () => {
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const navigate = useNavigate();
  const { showtimeId } = useParams();
  const { showtimes, loading } = useShowtime();
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const roomIdRef = useRef(null);

  // 💥 Move handleSeatUpdate lên đây trước khi dùng
  const handleSeatUpdate = (seatStatus) => {
    setSeatMatrix((prevMatrix) => {
      return prevMatrix.map((row) =>
        row.map((seat) => {
          if (seat && seat.seatId === seatStatus.seatId) {
            return {
              ...seat,
              status: seatStatus.status,
              isLocked: seatStatus.isLocked ?? seat.isLocked,
            };
          }
          return seat;
        })
      );
    });
  };

  const { sendSeatAction } = useSeatSocket(showtimeId, handleSeatUpdate); // Hook WebSocket

  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes);
  }, [showtimeId, showtimes]);

  const roomId = showtime?.room?.id ?? null;
  const movie = showtime?.movie ?? {};

  useEffect(() => {
    if (roomId !== roomIdRef.current) {
      roomIdRef.current = roomId;
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const fetchSeats = async () => {
      try {
        setIsLoading(true);

        const [roomData, lockedSeatIds] = await Promise.all([
          getRoomById(roomId),
          getSeatsLock(showtimeId),
        ]);

        const { numberOfRows, numberOfColumns, seats } = roomData;

        const seatsWithLock = seats.map((seat) => ({
          ...seat,
          isLocked: lockedSeatIds.includes(seat.seatId),
        }));

        const rowLabels = Array.from(
          new Set(seatsWithLock.map((seat) => seat.rowLabel))
        ).sort();

        const matrix = rowLabels.map((row) => {
          const rowSeats = Array(numberOfColumns).fill(null);
          seatsWithLock
            .filter((seat) => seat.rowLabel === row)
            .forEach((seat) => {
              rowSeats[seat.columnNumber - 1] = seat;
            });
          return rowSeats;
        });

        setSeatMatrix(matrix);
      } catch (error) {
        console.error("Error loading seats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [roomId]);

  const handleSelectSeat = (seatId, seatName) => {
    if (!selectedSeats.includes(seatId)) {
      setSelectedSeats((prev) => [...prev, seatId]);
    }
    sendSeatAction(seatId, "SELECT", userId);

    setSeatMatrix((prevMatrix) =>
      prevMatrix.map((row) =>
        row.map((seat) =>
          seat && seat.seatId === seatId
            ? { ...seat, status: "SELECTED" }
            : seat
        )
      )
    );

    const seat = seatMatrix.flat().find((seat) => seat.seatId === seatId);
    if (seat) {
      setTotalPrice((prevTotal) => prevTotal + seat.seatInfo.price);
    }
  };

  const handleReleaseSeat = (seatId, seatName) => {
    setSelectedSeats((prev) => prev.filter((id) => id !== seatId));
    sendSeatAction(seatId, "SELECTED", userId);

    setSeatMatrix((prevMatrix) =>
      prevMatrix.map((row) =>
        row.map((seat) =>
          seat && seat.seatId === seatId
            ? { ...seat, status: "AVAILABLE" }
            : seat
        )
      )
    );

    const seat = seatMatrix.flat().find((seat) => seat.seatId === seatId);
    if (seat) {
      setTotalPrice((prevTotal) => prevTotal - seat.seatInfo.price);
    }
  };

  const handlePayment = () => {
    navigate("/user/payment");
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
        <div>
          <div className="w-3/4 h-9 bg-red-300 text-center m-auto">
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
                      className={`w-${
                        seat.seatInfo.name === "COUPLE" ? "16" : "8"
                      } h-8 rounded-lg text-black border-2 ${
                        seat.isLocked
                          ? "bg-gray-400 text-white cursor-not-allowed"
                          : seat.status === "AVAILABLE"
                          ? "bg-white hover:bg-blue-900"
                          : seat.status === "SELECTED"
                          ? "bg-blue-900 text-white"
                          : seat.status === "BOOKED"
                          ? "bg-black text-white cursor-not-allowed"
                          : "bg-black cursor-not-allowed"
                      } ${
                        seat.seatInfo.name === "VIP"
                          ? "border-yellow-300"
                          : seat.seatInfo.name === "COUPLE"
                          ? "border-pink-400 w-16"
                          : "border-gray-300"
                      }`}
                      onClick={() => {
                        if (seat.status === "AVAILABLE") {
                          handleSelectSeat(seat.seatId, seat.seatName);
                        } else if (seat.status === "SELECTED") {
                          handleReleaseSeat(seat.seatId, seat.seatName);
                        }
                      }}
                      disabled={seat.status === "BOOKED" || seat.isLocked}
                    >
                      {seat.seatName}
                    </button>
                  ) : (
                    <div key={colIndex} />
                  )
                )}
              </div>
            ))}
          </div>
          <SeatLegend />
        </div>
        <div>
          <MovieInfo movie={movie} />
          <div>
            <p>Ngày: {showtime.showDate} </p>
            <p>Giờ: {showtime.startTime}</p>
            <p>
              Ghế:{" "}
              {selectedSeats
                .map(
                  (seatId) =>
                    seatMatrix.flat().find((seat) => seat.seatId === seatId)
                      ?.seatName
                )
                .join(", ")}
            </p>
            <p>Số vé: {selectedSeats.length}</p>
            <p>Tổng tiền: {totalPrice} VNĐ</p>
            <button
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={handlePayment}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
