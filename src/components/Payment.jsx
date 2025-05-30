"use client"

import { useState, useMemo, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useShowtime } from "../contexts/ShowtimeContext"
import { getShowtimeById } from "../utils/showtimeUtils"
import { extendSeatLock, addPayment, paymentMomo } from "../services/api"
import {
  CreditCard,
  Smartphone,
  Globe,
  ChevronLeft,
  ArrowRight,
  Clock,
  Calendar,
  MapPin,
  Ticket,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Film,
  DollarSign,
} from "lucide-react"

const Payment = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { seats = [], totalPrice = 0, showtimeId } = location.state || {}
  const { loading, showtimes } = useShowtime()
  const seatIds = seats.map((s) => s.seatId)
  const [paymentMethod, setPaymentMethod] = useState("momo")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success")
  const user = JSON.parse(localStorage.getItem("user"))
  const userId = user?.userId

  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes)
  }, [showtimeId, showtimes])

  useEffect(() => {
    const extend = async () => {
      try {
        const result = await extendSeatLock({
          showtimeId: Number.parseInt(showtimeId, 10),
          userId,
          seatIds,
        })
        console.log("Đã gia hạn giữ ghế:", result)
      } catch (error) {
        console.error("Gia hạn giữ ghế thất bại:", error)
        setToastType("error")
        setToastMessage("Không thể gia hạn giữ ghế. Vui lòng thử lại.")
        setShowToast(true)
      }
    }

    extend() // Gọi ngay khi vào trang thanh toán
  }, [showtimeId, userId, seatIds])

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const movieName = showtime?.movie?.title || showtime?.movie?.name || "Không xác định"
  const date = showtime?.showDate || "??/??/????"
  const time = showtime ? `${showtime.startTime} - ${showtime.endTime}` : "??:?? - ??:??"
  const seatNames = seats.map((seat) => seat.seatName).join(", ")
  const ticketCount = seats.length

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value)
  }

  const handlePayment = async () => {
    console.log("handlePayment called")
    setIsProcessing(true)

    try {
      const payment = await createPaymentData()
      console.log("Payment created:", payment)

      if (paymentMethod === "momo") {
        console.log("Calling processMomoPayment")
        await processMomoPayment(payment)
      } else {
        setToastType("success")
        setToastMessage("Thanh toán thành công!")
        setShowToast(true)
        setTimeout(() => {
          navigate("/user/booking-history")
        }, 2000)
      }
    } catch (error) {
      console.error("Thanh toán thất bại", error)
      setToastType("error")
      setToastMessage("Thanh toán thất bại! Vui lòng thử lại.")
      setShowToast(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const processMomoPayment = async (payment) => {
    console.log("processMomoPayment called with", payment)
    try {
      const momo = await paymentMomo(payment.sumPrice, payment.paymentId)
      console.log("Phản hồi MoMo:", momo)

      if (momo.payUrl) {
        window.location.href = momo.payUrl
      } else {
        setToastType("error")
        setToastMessage("Không nhận được liên kết thanh toán MoMo.")
        setShowToast(true)
      }
    } catch (error) {
      console.error("Lỗi khi gọi thanh toán MoMo:", error)
      setToastType("error")
      setToastMessage("Thanh toán MoMo thất bại!")
      setShowToast(true)
    }
  }

  const createPaymentData = async () => {
    const payload = {
      sumTicket: seats.length,
      sumPrice: totalPrice,
      methodPayment: paymentMethod,
      userId,
      showtimeId: Number.parseInt(showtimeId, 10),
    }

    try {
      const payment = await addPayment(payload)
      console.log("Tạo payment thành công:", payment)
      return payment
    } catch (error) {
      console.error("Lỗi khi tạo payment:", error)
      throw error
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const paymentOptions = [
    {
      id: "momo",
      name: "Thanh toán bằng Ví điện tử MoMo",
      icon: Smartphone,
      color: "from-pink-500 to-pink-600",
      description: "Thanh toán nhanh chóng và bảo mật",
    },
    {
      id: "helio",
      name: "Thanh toán bằng PayPal",
      icon: Globe,
      color: "from-blue-500 to-blue-600",
      description: "Thanh toán quốc tế an toàn",
    },
    {
      id: "visa",
      name: "Internet Banking/VISA",
      icon: CreditCard,
      color: "from-green-500 to-green-600",
      description: "Thanh toán qua thẻ ngân hàng",
    },
  ]

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gray-900 rounded-full"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-900 rounded-full"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6 shadow-lg relative">
                <DollarSign className="w-10 h-10 text-white" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-300 animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Đang tải thông tin thanh toán</h3>
              <p className="text-gray-500 text-center mb-6">Vui lòng đợi trong giây lát...</p>

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

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
            <div
                className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
                    showToast ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
                }`}
            >
              <div
                  className={`px-6 py-4 rounded-xl shadow-2xl flex items-center min-w-[320px] border ${
                      toastType === "success"
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/20"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/20"
                  }`}
              >
                <div className="bg-white/20 rounded-full p-1 mr-3">
                  {toastType === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <span className="font-medium text-sm">{toastMessage}</span>
                <button
                    onClick={() => setShowToast(false)}
                    className="ml-auto text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-bold">Thanh toán</h1>
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
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column - Payment methods */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
                      Phương thức thanh toán
                    </h2>

                    <div className="space-y-4">
                      {paymentOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                            <label
                                key={option.id}
                                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    paymentMethod === option.id
                                        ? "border-gray-600 bg-gray-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                              <input
                                  type="radio"
                                  name="payment"
                                  value={option.id}
                                  checked={paymentMethod === option.id}
                                  onChange={handlePaymentChange}
                                  className="sr-only"
                              />

                              {/* Icon */}
                              <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-br ${option.color} shadow-lg`}
                              >
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{option.name}</h3>
                                <p className="text-sm text-gray-500">{option.description}</p>
                              </div>

                              {/* Radio indicator */}
                              <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                      paymentMethod === option.id ? "border-gray-600 bg-gray-600" : "border-gray-300"
                                  }`}
                              >
                                {paymentMethod === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>

                              {/* Selected overlay */}
                              {paymentMethod === option.id && (
                                  <div className="absolute top-2 right-2">
                                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                              )}
                            </label>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right column - Booking details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Ticket className="w-6 h-6 mr-3 text-gray-600" />
                      Chi tiết đặt vé
                    </h2>

                    <div className="space-y-4">
                      {/* Movie info */}
                      <div className="flex items-start space-x-3 pb-4 border-b border-gray-200">
                        <div className="bg-gray-600 rounded-full p-2">
                          <Film className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{movieName}</p>
                          <p className="text-sm text-gray-500">Phim điện ảnh</p>
                        </div>
                      </div>

                      {/* Date and time */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Ngày chiếu</p>
                            <p className="text-gray-900">{date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Giờ chiếu</p>
                            <p className="text-gray-900">{time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Room and seats */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Phòng chiếu</p>
                            <p className="text-gray-900">{showtime?.room?.name || "Không xác định"}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">Ghế đã chọn</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {seats.map((seat) => (
                                  <span
                                      key={seat.seatId}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                {seat.seatName}
                              </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Số vé:</span>
                          <span className="font-medium text-gray-900">{ticketCount} vé</span>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-gray-900">Tổng tiền:</span>
                          <span className="text-gray-900">{formatCurrency(totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        disabled={isProcessing}
                        className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Quay lại
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className={`flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center transition-all duration-200 ${
                            isProcessing
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        }`}
                    >
                      {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                      ) : (
                          <>
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Thanh toán
                          </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default Payment
