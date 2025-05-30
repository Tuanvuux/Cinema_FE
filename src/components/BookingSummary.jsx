import { useNavigate } from "react-router-dom"
import { ChevronLeft, ShoppingCart, Clock, Calendar, Film, X } from "lucide-react"

const BookingSummary = ({
                            movie,
                            showtime,
                            selectedSeats,
                            seatMatrix,
                            totalPrice,
                            onReleaseSeat,
                            onPayment,
                            formatCurrency,
                        }) => {
    const navigate = useNavigate()

    return (
        <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                {/* Movie info */}
                <div className="relative mb-6 pb-6 border-b border-gray-200">
                    {/* Compact movie poster and info */}
                    <div className="flex items-start space-x-4">
                        {/* Larger poster */}
                        <div className="relative group flex-shrink-0">
                            <div className="relative overflow-hidden rounded-lg shadow-md">
                                <img
                                    src={movie.posterUrl || "/placeholder.svg"}
                                    alt={movie.name}
                                    className="w-32 h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Age rating badge */}
                                {movie.ageLimit !== undefined && (
                                    <div className="absolute top-2 right-2">
                                        <div
                                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                !movie.ageLimit ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {!movie.ageLimit ? "P" : "C" + movie.ageLimit}
                                        </div>
                                    </div>
                                )}
                                {/* Subtle hover overlay */}
                                <div
                                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                            </div>
                        </div>

                        {/* Movie details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-xl mb-3 truncate">{movie.name}</h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Film className="w-4 h-4 mr-2 flex-shrink-0"/>
                                    <span className="truncate">{movie.category?.name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="w-4 h-4 mr-2 flex-shrink-0"/>
                                    <span>{movie.duration} phút</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking details */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Chi tiết đặt vé</h3>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-700">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Ngày:</span>
                            </div>
                            <span className="font-medium text-gray-900">{showtime?.showDate}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-700">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Giờ:</span>
                            </div>
                            <span className="font-medium text-gray-900">{showtime?.startTime}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center text-gray-700">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    ></path>
                                </svg>
                                <span>Phòng:</span>
                            </div>
                            <span className="font-medium text-gray-900">{showtime?.room?.name}</span>
                        </div>
                    </div>

                    {/* Selected seats */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center text-gray-700">
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                    ></path>
                                </svg>
                                <span>Ghế đã chọn:</span>
                            </div>
                            <span className="font-medium text-gray-900">{selectedSeats.length} ghế</span>
                        </div>

                        {selectedSeats.length > 0 ? (
                            <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                    {selectedSeats
                                        .map((seatId) => seatMatrix.flat().find((seat) => seat && seat.seatId === seatId))
                                        .filter(Boolean)
                                        .map((seat) => (
                                            <div key={seat.seatId} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                                <span className="font-medium text-gray-800">{seat.seatName}</span>
                                                <button
                                                    onClick={() => onReleaseSeat(seat.seatId, seat.seatName)}
                                                    className="ml-2 text-gray-500 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center text-gray-500 text-sm border border-dashed border-gray-300">
                                Chưa chọn ghế nào
                            </div>
                        )}
                    </div>

                    {/* Total price */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Tổng tiền:</span>
                            <span className="font-bold text-xl text-gray-900">{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Quay lại
                        </button>
                        <button
                            onClick={onPayment}
                            disabled={selectedSeats.length === 0}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center ${
                                selectedSeats.length === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                            }`}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Đặt vé
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingSummary
