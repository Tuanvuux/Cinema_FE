import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShowtime } from "../contexts/ShowtimeContext";
import {
  getRoomById,
  getBookedSeat,
  getLockedSeat,
  getMaintenanceSeat,
} from "../services/api";
import { getShowtimeById } from "../utils/showtimeUtils";
import useSeatSocket from "../hooks/useSeatSocket";
import MovieInfo from "./MovieInfo";
import SeatLegend from "./SeatLegend";
import { toast } from "react-toastify";
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
  const isProcessingRef = useRef(false);
  const [bookedSeatIds, setBookedSeatIds] = useState([]);

  const handleSeatUpdate = useCallback(
    (seatStatus) => {
      // Nếu là dạng gửi nhiều ghế (từ BACKEND khi BOOKED), xử lý mảng seatIds
      if (seatStatus.status === "BOOKED" && Array.isArray(seatStatus.seatIds)) {
        setSeatMatrix((prevMatrix) =>
          prevMatrix.map((row) =>
            row.map((seat) => {
              if (seat && seatStatus.seatIds.includes(seat.seatId)) {
                return {
                  ...seat,
                  status: "BOOKED",
                  isLocked: false,
                  isLockedByMe: false,
                };
              }
              return seat;
            })
          )
        );

        setBookedSeatIds((prev) => [
          ...new Set([...prev, ...seatStatus.seatIds]),
        ]);

        setSelectedSeats((prev) =>
          prev.filter((id) => !seatStatus.seatIds.includes(id))
        );

        updateTotalPrice(
          selectedSeats.filter((id) => !seatStatus.seatIds.includes(id))
        );

        toast.info(`Ghế ${seatStatus.seatIds.join(", ")} đã được đặt.`);
        return;
      }

      // Trường hợp bình thường (ghế được chọn / hủy giữ)
      setSeatMatrix((prevMatrix) =>
        prevMatrix.map((row) =>
          row.map((seat) => {
            if (seat && seat.seatId === seatStatus.seatId) {
              const isNowAvailable = seatStatus.status === "AVAILABLE";
              return {
                ...seat,
                status: seatStatus.status,
                isLocked: !isNowAvailable,
                isLockedByMe:
                  seatStatus.userId === userId &&
                  seatStatus.status === "SELECTED",
              };
            }
            return seat;
          })
        )
      );

      if (
        seatStatus.status === "AVAILABLE" &&
        selectedSeats.includes(seatStatus.seatId)
      ) {
        toast.dismiss(`seat-${seatStatus.seatId}`);
        toast.info(`Ghế ${seatStatus.seatId} đã bị hủy do hết thời gian giữ.`, {
          toastId: `seat-${seatStatus.seatId}`,
        });
        setSelectedSeats((prev) =>
          prev.filter((id) => id !== seatStatus.seatId)
        );

        const seat = seatMatrix
          .flat()
          .find((s) => s.seatId === seatStatus.seatId);
        if (seat) {
          setTotalPrice((prev) => prev - seat.seatInfo.price);
        }
      }
    },
    [selectedSeats, userId, seatMatrix]
  );

  const { sendSeatAction } = useSeatSocket(showtimeId, handleSeatUpdate);

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
    if (!isLoading && seatMatrix.length > 0) {
      const lockedByMeSeats = seatMatrix
        .flat()
        .filter((seat) => seat && seat.isLockedByMe)
        .map((seat) => seat.seatId);

      setSelectedSeats(lockedByMeSeats);
      updateTotalPrice(lockedByMeSeats);
    }
  }, [isLoading, seatMatrix]);

  useEffect(() => {
    if (!roomId) return;

    const fetchSeats = async () => {
      try {
        setIsLoading(true);

        const [roomData, bookedSeats, lockedSeats, maintenanceSeats] =
          await Promise.all([
            getRoomById(roomId),
            getBookedSeat(showtimeId),
            getLockedSeat(showtimeId), // [{ seatId, userId }]
            getMaintenanceSeat(showtimeId),
          ]);

        const { numberOfRows, numberOfColumns, seats } = roomData;
        const bookedIds = bookedSeats || [];
        setBookedSeatIds(bookedIds);

        const seatsWithStatus = seats.map((seat) => {
          const lockedInfo = lockedSeats.find(
            (locked) => locked.seatId === seat.seatId
          );
          const isLocked = !!lockedInfo;
          const isLockedByMe = lockedInfo?.userId === userId;

          let status = "AVAILABLE";
          if (bookedIds.includes(seat.seatId)) {
            status = "BOOKED";
          } else if (maintenanceSeats.includes(seat.seatId)) {
            status = "MAINTENANCE"; // 👉 gán trạng thái bảo trì
          } else if (isLockedByMe) {
            status = "SELECTED";
          }

          return {
            ...seat,
            isLocked,
            isLockedByMe,
            status,
          };
        });

        const rowLabels = Array.from(
          new Set(seatsWithStatus.map((seat) => seat.rowLabel))
        ).sort();

        const matrix = rowLabels.map((row) => {
          const rowSeats = Array(numberOfColumns).fill(null);
          seatsWithStatus
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
  }, [roomId, showtimeId]);

  const updateTotalPrice = (newSelectedSeats) => {
    const newTotal = seatMatrix
      .flat()
      .filter(
        (seat) =>
          seat &&
          newSelectedSeats.includes(seat.seatId) &&
          seat.isLockedByMe === true &&
          seat.status === "SELECTED" // ✅ Ghế đang giữ, chưa BOOKED
      )
      .reduce((sum, seat) => sum + seat.seatInfo.price, 0);

    setTotalPrice(newTotal);
  };

  const handleSelectSeat = async (seatId, seatName) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      if (selectedSeats.length >= 8) {
        toast.warn("Bạn chỉ được chọn tối đa 8 ghế trong 1 lần đặt.");
        return;
      }

      if (!selectedSeats.includes(seatId)) {
        const newSelectedSeats = [...selectedSeats, seatId];
        setSelectedSeats(newSelectedSeats);
        updateTotalPrice(newSelectedSeats);
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
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 300);
    }
  };

  const handleReleaseSeat = (seatId, seatName) => {
    setSelectedSeats((prevSelected) => {
      const newSelectedSeats = prevSelected.filter((id) => id !== seatId);

      updateTotalPrice(newSelectedSeats);

      return newSelectedSeats;
    });

    sendSeatAction(seatId, "AVAILABLE", userId);

    setSeatMatrix((prevMatrix) =>
      prevMatrix.map((row) =>
        row.map((seat) =>
          seat && seat.seatId === seatId
            ? {
                ...seat,
                status: "AVAILABLE",
                isLocked: false,
                isLockedByMe: false,
              }
            : seat
        )
      )
    );
  };

  const handlePayment = () => {
    const selectedSeatObjects = seatMatrix
      .flat()
      .filter((seat) => seat && selectedSeats.includes(seat.seatId));

    navigate("/user/payment", {
      state: {
        seats: selectedSeatObjects,
        totalPrice,
        showtimeId,
      },
    });
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
          <div className="w-3/4 h-9 bg-gray-500 text-white text-center m-auto">
            MÀN HÌNH
          </div>
          <div className="seat-container grid gap-4 mt-7">
            {seatMatrix.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="seat-row grid justify-center gap-x-2"
                style={{
                  gridTemplateColumns: `repeat(${row.length}, minmax(32px, 32px))`,
                }}
              >
                {row.map((seat, colIndex) =>
                  seat ? (
                    <button
                      key={seat.seatId}
                      className={`relative h-8 rounded-lg border-2 text-black flex items-center justify-center
          ${
            seat.status === "MAINTENANCE"
              ? "bg-white text-black cursor-not-allowed"
              : seat.status === "BOOKED"
              ? "bg-black text-white cursor-not-allowed"
              : seat.isLocked && !seat.isLockedByMe
              ? "bg-gray-300 text-white cursor-not-allowed"
              : seat.isLockedByMe
              ? "bg-blue-900 text-white"
              : "bg-white hover:bg-blue-900"
          }
          ${
            seat.seatInfo.name === "VIP"
              ? "border-yellow-300"
              : seat.seatInfo.name === "COUPLE"
              ? "border-pink-400"
              : "border-gray-300"
          }
        `}
                      style={
                        seat.seatInfo.name === "COUPLE"
                          ? { gridColumn: "span 2" }
                          : {}
                      }
                      disabled={
                        seat.status === "BOOKED" ||
                        seat.status === "MAINTENANCE" ||
                        (seat.isLocked && !seat.isLockedByMe)
                      }
                      onClick={() => {
                        if (seat.status === "AVAILABLE") {
                          handleSelectSeat(seat.seatId, seat.seatName);
                        } else if (seat.isLockedByMe) {
                          handleReleaseSeat(seat.seatId, seat.seatName);
                        }
                      }}
                    >
                      <span className="relative z-10">{seat.seatName}</span>
                      {seat.status === "MAINTENANCE" && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                          <div className="w-full h-full relative">
                            <span className="absolute w-[2px] h-full bg-gray-500 rotate-45 left-1/2 top-0 transform -translate-x-1/2" />
                            <span className="absolute w-[2px] h-full bg-gray-500 -rotate-45 left-1/2 top-0 transform -translate-x-1/2" />
                          </div>
                        </div>
                      )}
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
              className="mt-4 bg-white text-gray-900 border-1 border-gray-900 py-2 px-8 mr-4 rounded-full hover:text-white hover:bg-gray-900"
              onClick={() => navigate(-1)}
            >
              Hủy
            </button>
            <button
              className={`mt-4 py-2 px-6 rounded-full border-1 ${
                selectedSeats.length === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-900 hover:text-white hover:bg-gray-900"
              }`}
              disabled={selectedSeats.length === 0}
              onClick={handlePayment}
            >
              Đặt vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
