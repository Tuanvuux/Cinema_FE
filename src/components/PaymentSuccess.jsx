import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { getPaymentById } from "../services/api"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import QRCode from "qrcode"
import { formatTime, formatDate } from "../utils/helpers"
import {
  CheckCircle,
  Download,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
  Shield,
  QrCode,
  Star,
} from "lucide-react"

const PaymentSuccess = () => {
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("orderId")
  const user = JSON.parse(localStorage.getItem("user"))

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getPaymentById(orderId)
        console.log("data", data)
        setPaymentData(data)
      } catch (err) {
        console.error("Lỗi khi lấy danh sách vé:", err)
        setError("Không thể tải vé.")
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchTickets()
    }
  }, [orderId])

  const handleGetTicket = async () => {
    if (!paymentData) return

    setIsGeneratingPDF(true)

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [180, 90],
      })

      for (let index = 0; index < paymentData.paymentDetails.length; index++) {
        const ticket = paymentData.paymentDetails[index]
        if (index > 0) doc.addPage()

        doc.setFillColor(255, 253, 208)
        doc.rect(0, 0, 180, 110, "F")

        const qrData = JSON.stringify({
          paymentId: paymentData.paymentId,
          userId: paymentData.userId,
          ticketId: ticket.id,
        })

        const qrCodeDataUrl = await QRCode.toDataURL(qrData)
        doc.addImage(qrCodeDataUrl, "PNG", 130, 10, 40, 40)

        doc.setFontSize(18)
        doc.text("VE XEM PHIM - Rap CineX", 20, 20)
        doc.setFontSize(12)
        doc.text("Dia Chi: 71 Ngu Hanh Son, Son Tra, Da Nang", 20, 30)
        doc.text(`Phim: ${paymentData.movieTitle}`, 20, 45)
        doc.text(`Phong chieu: ${paymentData.roomName}`, 20, 55)
        doc.text(`Thoi gian: ${formatTime(paymentData.startTime)} - ${formatDate(paymentData.showDate)}`, 20, 65)
        doc.text(`Ghe: ${ticket.seatName}`, 20, 75)
      }

      doc.save("ve-xem-phim.pdf")
    } catch (error) {
      console.error("Lỗi khi tạo PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading) {
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
              <h3 className="text-xl font-bold text-gray-700 mb-2">Đang tải thông tin vé</h3>
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không thể tải thông tin vé</h3>
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

  if (!paymentData) return null

  const isOwner = user && user.userId === paymentData.userId
  if (!isOwner) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-w-[400px] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500 rounded-full"></div>
            </div>

            {/* Unauthorized content */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h3>
              <p className="text-red-600 font-medium text-center mb-6">Bạn không có quyền xem thông tin này!</p>
              <p className="text-gray-500 text-center mb-6">Vui lòng kiểm tra lại tài khoản hoặc liên hệ hỗ trợ.</p>

              <button
                  onClick={() => (window.location.href = "/")}
                  className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
    )
  }

  const formattedDate = formatDate(paymentData.showDate)
  const formattedTime = formatTime(paymentData.startTime)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-lg text-gray-600">Cảm ơn bạn đã đặt vé tại CineX Cinema</p>

            {/* Success animation */}
          </div>

          <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-2">
                  <Ticket className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold">Thông tin vé điện tử</h2>
              </div>
            </div>

            {/* Main content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left column - Payment details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <CreditCard className="w-6 h-6 mr-3 text-gray-600" />
                      Chi tiết giao dịch
                    </h3>

                    <div className="space-y-4">
                      {/* Transaction ID */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-600 rounded-full p-2">
                            <QrCode className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">Mã giao dịch:</span>
                        </div>
                        <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {paymentData.paymentId}
                      </span>
                      </div>

                      {/* Payment method */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-600 rounded-full p-2">
                            <CreditCard className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">Phương thức:</span>
                        </div>
                        <span className="font-medium text-gray-900 capitalize">{paymentData.methodPayment}</span>
                      </div>

                      {/* Total amount */}
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-600 rounded-full p-2">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              />
                            </svg>
                          </div>
                          <span className="font-bold text-gray-700">Tổng tiền:</span>
                        </div>
                        <span className="font-bold text-xl text-green-700">{formatCurrency(paymentData.sumPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column - Movie details */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Film className="w-6 h-6 mr-3 text-gray-600" />
                      Thông tin phim
                    </h3>

                    <div className="space-y-4">
                      {/* Movie title */}
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="bg-gray-600 rounded-full p-2 mt-0.5">
                          <Film className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Tên phim</p>
                          <p className="text-gray-900 font-semibold">{paymentData.movieTitle}</p>
                        </div>
                      </div>

                      {/* Date and time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Ngày chiếu</p>
                            <p className="text-gray-900 font-medium">{formattedDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Giờ chiếu</p>
                            <p className="text-gray-900 font-medium">{formattedTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Room */}
                      <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="bg-gray-600 rounded-full p-2">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Phòng chiếu</p>
                          <p className="text-gray-900 font-semibold">{paymentData.roomName}</p>
                        </div>
                      </div>

                      {/* Seats */}
                      <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="bg-gray-600 rounded-full p-2 mt-0.5">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700 mb-2">Ghế đã đặt ({paymentData.sumTicket} vé)</p>
                          <div className="flex flex-wrap gap-2">
                            {paymentData.paymentDetails.map((detail) => (
                                <span
                                    key={detail.id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-300"
                                >
                              {detail.seatName}
                            </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download ticket button */}
              <div className="mt-8 text-center">
                <button
                    type="button"
                    onClick={handleGetTicket}
                    disabled={isGeneratingPDF}
                    className={`inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                        isGeneratingPDF
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    }`}
                >
                  {isGeneratingPDF ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Đang tạo vé...
                      </>
                  ) : (
                      <>
                        <Download className="w-6 h-6 mr-3" />
                        Lấy vé điện tử (PDF)
                      </>
                  )}
                </button>

                <p className="mt-3 text-sm text-gray-500">Vé điện tử sẽ được tải xuống dưới dạng file PDF với mã QR</p>
              </div>

              {/* Additional info */}
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-600 rounded-full p-2 mt-0.5">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng:</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Vui lòng có mặt tại rạp trước giờ chiếu 15 phút</li>
                      <li>• Mang theo vé điện tử hoặc mã QR để quét tại cửa</li>
                      <li>• Liên hệ hotline nếu cần hỗ trợ: 1900-xxxx</li>
                      <li>• Vé đã mua không thể đổi trả</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default PaymentSuccess
