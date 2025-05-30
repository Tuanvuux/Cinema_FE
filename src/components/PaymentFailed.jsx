
import { useNavigate } from "react-router-dom"
import { AlertTriangle, RefreshCw, ArrowLeft, CreditCard, Phone, HelpCircle } from "lucide-react"

const PaymentFailed = () => {
    const navigate = useNavigate()

    const handleRetry = () => {
        navigate(-1)
    }

    const handleGoHome = () => {
        navigate("/")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold">Thanh toán thất bại</h1>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="p-8">
                        {/* Error icon and message */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Giao dịch không thành công</h2>
                            <p className="text-gray-600">
                                Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                            </p>
                        </div>

                        {/* Possible reasons */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Nguyên nhân có thể:
                            </h3>
                            <ul className="text-red-800 text-sm space-y-1">
                                <li>• Số dư tài khoản không đủ</li>
                                <li>• Thông tin thẻ không chính xác</li>
                                <li>• Kết nối mạng không ổn định</li>
                                <li>• Phiên giao dịch đã hết hạn</li>
                            </ul>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Thử lại thanh toán
                            </button>

                            <button
                                onClick={handleGoHome}
                                className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Về trang chủ
                            </button>
                        </div>

                        {/* Support info */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Cần hỗ trợ? Gọi hotline:{" "}
                                <a href="tel:1900-xxxx" className="text-red-600 hover:text-red-700 font-medium hover:underline">
                                    0383462531
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional help card */}
            </div>
        </div>
    )
}

export default PaymentFailed
