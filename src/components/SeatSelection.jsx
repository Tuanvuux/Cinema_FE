"use client"

import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useShowtime } from "../contexts/ShowtimeContext"
import { getRoomById, getBookedSeat, getLockedSeat, getMaintenanceSeat } from "../services/api"
import { getShowtimeById } from "../utils/showtimeUtils"
import useSeatSocket from "../hooks/useSeatSocket"
import { toast } from "react-toastify"
import BookingSummary from "./BookingSummary"
import { AlertCircle, Monitor, X, Check, Info, ChevronLeft, Ticket } from "lucide-react"
import SeatLegend from "@/components/SeatLegend.jsx";

const SeatSelection = () => {
  const [seatMatrix, setSeatMatrix] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const navigate = useNavigate()
  const { showtimeId } = useParams()
  const { showtimes, loading } = useShowtime()
  const user = JSON.parse(localStorage.getItem("user"))
  const userId = user?.userId
  const roomIdRef = useRef(null)
  const isProcessingRef = useRef(false)
  const [bookedSeatIds, setBookedSeatIds] = useState([])
  const [error, setError] = useState(null)

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
                      }
                    }
                    return seat
                  }),
              ),
          )

          setBookedSeatIds((prev) => [...new Set([...prev, ...seatStatus.seatIds])])

          setSelectedSeats((prev) => prev.filter((id) => !seatStatus.seatIds.includes(id)))

          updateTotalPrice(selectedSeats.filter((id) => !seatStatus.seatIds.includes(id)))

          toast.info(`Ghế ${seatStatus.seatIds.join(", ")} đã được đặt.`)
          return
        }

        // Trường hợp bình thường (ghế được chọn / hủy giữ)
        setSeatMatrix((prevMatrix) =>
            prevMatrix.map((row) =>
                row.map((seat) => {
                  if (seat && seat.seatId === seatStatus.seatId) {
                    const isNowAvailable = seatStatus.status === "AVAILABLE"
                    return {
                      ...seat,
                      status: seatStatus.status,
                      isLocked: !isNowAvailable,
                      isLockedByMe: seatStatus.userId === userId && seatStatus.status === "SELECTED",
                    }
                  }
                  return seat
                }),
            ),
        )

        if (seatStatus.status === "AVAILABLE" && selectedSeats.includes(seatStatus.seatId)) {
          toast.dismiss(`seat-${seatStatus.seatId}`)
          toast.info(`Ghế ${seatStatus.seatId} đã bị hủy do hết thời gian giữ.`, {
            toastId: `seat-${seatStatus.seatId}`,
          })
          setSelectedSeats((prev) => prev.filter((id) => id !== seatStatus.seatId))

          const seat = seatMatrix.flat().find((s) => s.seatId === seatStatus.seatId)
          if (seat) {
            setTotalPrice((prev) => prev - seat.seatInfo.price)
          }
        }
      },
      [selectedSeats, userId, seatMatrix],
  )

  const { sendSeatAction } = useSeatSocket(showtimeId, handleSeatUpdate)

  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes)
  }, [showtimeId, showtimes])

  const roomId = showtime?.room?.id ?? null
  const movie = showtime?.movie ?? {}

  useEffect(() => {
    if (roomId !== roomIdRef.current) {
      roomIdRef.current = roomId
    }
  }, [roomId])

  useEffect(() => {
    if (!isLoading && seatMatrix.length > 0) {
      const lockedByMeSeats = seatMatrix
          .flat()
          .filter((seat) => seat && seat.isLockedByMe)
          .map((seat) => seat.seatId)

      setSelectedSeats(lockedByMeSeats)
      updateTotalPrice(lockedByMeSeats)
    }
  }, [isLoading, seatMatrix])

  useEffect(() => {
    if (!roomId) return

    const fetchSeats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [roomData, bookedSeats, lockedSeats, maintenanceSeats] = await Promise.all([
          getRoomById(roomId),
          getBookedSeat(showtimeId),
          getLockedSeat(showtimeId), // [{ seatId, userId }]
          getMaintenanceSeat(showtimeId),
        ])

        const { numberOfRows, numberOfColumns, seats } = roomData
        const bookedIds = bookedSeats || []
        setBookedSeatIds(bookedIds)

        const seatsWithStatus = seats.map((seat) => {
          const lockedInfo = lockedSeats.find((locked) => locked.seatId === seat.seatId)
          const isLocked = !!lockedInfo
          const isLockedByMe = lockedInfo?.userId === userId

          let status = "AVAILABLE"
          if (bookedIds.includes(seat.seatId)) {
            status = "BOOKED"
          } else if (maintenanceSeats.includes(seat.seatId)) {
            status = "MAINTENANCE" // 👉 gán trạng thái bảo trì
          } else if (isLockedByMe) {
            status = "SELECTED"
          }

          return {
            ...seat,
            isLocked,
            isLockedByMe,
            status,
          }
        })

        const rowLabels = Array.from(new Set(seatsWithStatus.map((seat) => seat.rowLabel))).sort()

        const matrix = rowLabels.map((row) => {
          const rowSeats = Array(numberOfColumns).fill(null)
          seatsWithStatus
              .filter((seat) => seat.rowLabel === row)
              .forEach((seat) => {
                rowSeats[seat.columnNumber - 1] = seat
              })
          return rowSeats
        })

        setSeatMatrix(matrix)
      } catch (error) {
        console.error("Error loading seats:", error)
        setError("Không thể tải thông tin ghế ngồi. Vui lòng thử lại sau.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSeats()
  }, [roomId, showtimeId, userId])

  const updateTotalPrice = (newSelectedSeats) => {
    const newTotal = seatMatrix
        .flat()
        .filter(
            (seat) =>
                seat && newSelectedSeats.includes(seat.seatId) && seat.isLockedByMe === true && seat.status === "SELECTED", // ✅ Ghế đang giữ, chưa BOOKED
        )
        .reduce((sum, seat) => sum + seat.seatInfo.price, 0)

    setTotalPrice(newTotal)
  }

  const handleSelectSeat = async (seatId, seatName) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      if (selectedSeats.length >= 8) {
        toast.warn("Bạn chỉ được chọn tối đa 8 ghế trong 1 lần đặt.")
        return
      }

      if (!selectedSeats.includes(seatId)) {
        const newSelectedSeats = [...selectedSeats, seatId]
        setSelectedSeats(newSelectedSeats)
        updateTotalPrice(newSelectedSeats)
      }

      sendSeatAction(seatId, "SELECT", userId)

      setSeatMatrix((prevMatrix) =>
          prevMatrix.map((row) =>
              row.map((seat) => (seat && seat.seatId === seatId ? { ...seat, status: "SELECTED" } : seat)),
          ),
      )
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false
      }, 300)
    }
  }

  const handleReleaseSeat = (seatId, seatName) => {
    setSelectedSeats((prevSelected) => {
      const newSelectedSeats = prevSelected.filter((id) => id !== seatId)

      updateTotalPrice(newSelectedSeats)

      return newSelectedSeats
    })

    sendSeatAction(seatId, "AVAILABLE", userId)

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
                    : seat,
            ),
        ),
    )
  }

  const handlePayment = () => {
    const selectedSeatObjects = seatMatrix.flat().filter((seat) => seat && selectedSeats.includes(seat.seatId))

    navigate("/user/payment", {
      state: {
        seats: selectedSeatObjects,
        totalPrice,
        showtimeId,
      },
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading || isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gray-900 rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-900 rounded-full"></div>
            </div>

            {/* Loading animation */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6 shadow-lg relative">
                <Ticket className="w-10 h-10 text-white" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-300 animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Đang tải sơ đồ ghế</h3>
              <p className="text-gray-500 text-center mb-6">Vui lòng đợi trong giây lát...</p>

              {/* Loading progress dots */}
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                    className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                    className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500 rounded-full"></div>
            </div>

            {/* Error content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không thể tải sơ đồ ghế</h3>
              <p className="text-red-600 font-medium text-center mb-6">{error}</p>

              <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Thử lại
              </button>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-bold">Chọn ghế</h1>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column - Seat selection */}
                <div className="lg:col-span-2">
                  {/* Screen */}
                  <div className="relative mb-12">
                    <div className="w-full h-12 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg text-white flex items-center justify-center font-bold shadow-lg">
                      <Monitor className="w-5 h-5 mr-2" /> MÀN HÌNH
                    </div>
                    <div className="absolute -bottom-6 left-0 right-0 h-6 bg-gradient-to-b from-gray-300/50 to-transparent"></div>
                  </div>

                  {/* Seat matrix - Improved version */}
                  <div className="seat-container overflow-x-auto pb-4">
                    <div className="min-w-max">
                      {seatMatrix.map((row, rowIndex) => {
                        // Đếm số ghế thực tế trong hàng này
                        const actualSeats = row.filter((seat) => seat !== null)
                        const hasSeats = actualSeats.length > 0

                        if (!hasSeats) return null // Bỏ qua hàng không có ghế nào

                        // Kiểm tra xem có phải hàng couple không
                        const isCoupleSeatRow = actualSeats.some((seat) => seat?.seatInfo?.name === "COUPLE")

                        return (
                            <div key={rowIndex} className="seat-row flex items-center mb-3">
                              {/* Row label */}
                              <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-700 mr-3">
                                {actualSeats[0]?.rowLabel || ""}
                              </div>

                              {/* Seats - căn giữa chỉ khi là hàng couple */}
                              <div className={`flex gap-2 ${isCoupleSeatRow ? "justify-center" : "justify-start"}`}>
                                {row.map((seat, colIndex) => {
                                  // Chỉ render khi có ghế thực tế
                                  if (!seat) return null

                                  return (
                                      <button
                                          key={seat.seatId}
                                          className={`relative h-10 rounded-lg border-2 text-sm font-medium flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                                              seat.status === "MAINTENANCE"
                                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300"
                                                  : seat.status === "BOOKED"
                                                      ? "bg-gray-800 text-white cursor-not-allowed border-gray-700"
                                                      : seat.isLocked && !seat.isLockedByMe
                                                          ? "bg-gray-300 text-gray-600 cursor-not-allowed border-gray-400"
                                                          : seat.isLockedByMe
                                                              ? "bg-blue-900 text-white border-gray-500 shadow-md"
                                                              : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"
                                          } ${
                                              seat.seatInfo.name === "VIP"
                                                  ? "border-yellow-400 w-10"
                                                  : seat.seatInfo.name === "COUPLE"
                                                      ? "border-pink-400 w-[5.25rem]"
                                                      : "w-10"
                                          }`}
                                          disabled={
                                              seat.status === "BOOKED" ||
                                              seat.status === "MAINTENANCE" ||
                                              (seat.isLocked && !seat.isLockedByMe)
                                          }
                                          onClick={() => {
                                            if (seat.status === "AVAILABLE") {
                                              handleSelectSeat(seat.seatId, seat.seatName)
                                            } else if (seat.isLockedByMe) {
                                              handleReleaseSeat(seat.seatId, seat.seatName)
                                            }
                                          }}
                                      >
                                        <span className="relative z-10">{seat.seatName}</span>
                                        {seat.status === "MAINTENANCE" && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                              <X className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        {seat.isLockedByMe && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                              <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                      </button>
                                  )
                                })}
                              </div>
                            </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Seat legend */}
                  <SeatLegend/>
                </div>

                {/* Right column - Movie info and booking summary */}
                <BookingSummary
                    movie={movie}
                    showtime={showtime}
                    selectedSeats={selectedSeats}
                    seatMatrix={seatMatrix}
                    totalPrice={totalPrice}
                    onReleaseSeat={handleReleaseSeat}
                    onPayment={handlePayment}
                    formatCurrency={formatCurrency}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default SeatSelection
