import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Ticket,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  Receipt, ArrowLeft,
} from "lucide-react";
import { getPaymentByUserId } from "../services/api";
import {useNavigate} from "react-router-dom";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success or error
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = storedUser.userId;

        if (userId) {
          const data = await getPaymentByUserId(userId);
          setPayments(
            data.sort(
              (a, b) =>
                new Date(b.dateTransaction).getTime() -
                new Date(a.dateTransaction).getTime()
            )
          );
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        setError("Không thể tải lịch sử thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: {
        label: "Thành công",
        className: "bg-green-100 text-green-800",
      },
      PENDING: {
        label: "Đang xử lý",
        className: "bg-yellow-100 text-yellow-800",
      },
      FAILED: { label: "Thất bại", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case "momo":
        return (
          <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
        );
      case "vnpay":
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            V
          </div>
        );
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const toggleCardExpansion = (paymentId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedCards(newExpanded);
  };

  return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
            <div
                className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
                    showToast
                        ? "translate-x-0 opacity-100 scale-100"
                        : "translate-x-full opacity-0 scale-95"
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
                  {toastType === "success" ? (
                      <CheckCircle className="w-5 h-5"/>
                  ) : (
                      <AlertCircle className="w-5 h-5"/>
                  )}
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
          <button
              onClick={() => navigate("/user/userInfo")}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2"/>
            Quay lại trang thông tin cá nhân
          </button>
          {loading ? (
              <div
                  className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-gray-900 animate-spin mb-4"/>
                <p className="text-gray-600 font-medium">
                  Đang tải lịch sử thanh toán...
                </p>
              </div>
          ) : error ? (
              <div
                  className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4"/>
                <p className="text-red-600 font-medium">{error}</p>
              </div>
          ) : (
              <div
                  className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6 text-white">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-full p-3">
                      <Receipt className="h-8 w-8"/>
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">Lịch sử thanh toán</h2>
                      <p className="text-gray-200">
                        Xem lại các giao dịch mua vé của bạn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Ticket className="h-6 w-6 text-blue-600"/>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Tổng giao dịch
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {payments.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Users className="h-6 w-6 text-green-600"/>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Tổng vé đã mua
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {payments.reduce(
                              (sum, payment) => sum + payment.sumTicket,
                              0
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <CreditCard className="h-6 w-6 text-purple-600"/>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">
                          Tổng chi tiêu
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(
                              payments.reduce(
                                  (sum, payment) => sum + payment.sumPrice,
                                  0
                              )
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment List */}
                <div className="px-8 pb-8">
                  {payments.length === 0 ? (
                      <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Chưa có giao dịch nào
                        </h3>
                        <p className="text-gray-500">
                          Bạn chưa thực hiện giao dịch mua vé nào.
                        </p>
                      </div>
                  ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                            <div
                                key={payment.paymentId}
                                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="p-4 bg-white">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                      {payment.movieTitle}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4"/>
                                        {formatDate(payment.dateTransaction)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {getPaymentMethodIcon(payment.methodPayment)}
                                        <span className="capitalize">
                                  {payment.methodPayment}
                                </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    {getStatusBadge(payment.status)}
                                    <p className="text-xl font-bold text-gray-900 mt-2">
                                      {formatCurrency(payment.sumPrice)}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500"/>
                                    <span className="text-sm text-gray-600">
                              {payment.roomName}
                            </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500"/>
                                    <span className="text-sm text-gray-600">
                              {new Date(payment.showDate).toLocaleDateString(
                                  "vi-VN"
                              )}
                            </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500"/>
                                    <span className="text-sm text-gray-600">
                              {payment.startTime}
                            </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Ticket className="w-4 h-4 text-gray-500"/>
                                    <span className="text-sm text-gray-600">
                              {payment.sumTicket} vé
                            </span>
                                  </div>
                                </div>

                                <button
                                    onClick={() => toggleCardExpansion(payment.paymentId)}
                                    className="w-full mt-4 flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                          <span>
                            Chi tiết ghế ({payment.paymentDetails.length} ghế)
                          </span>
                                  {expandedCards.has(payment.paymentId) ? (
                                      <ChevronUp className="w-4 h-4"/>
                                  ) : (
                                      <ChevronDown className="w-4 h-4"/>
                                  )}
                                </button>

                                {expandedCards.has(payment.paymentId) && (
                                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {payment.paymentDetails.map((detail) => (
                                            <div
                                                key={detail.id}
                                                className="bg-white rounded-lg p-3 border border-gray-200"
                                            >
                                              <div className="text-center">
                                                <div className="font-semibold text-gray-900 mb-1">
                                                  Ghế {detail.seatName}
                                                </div>
                                                <div className="text-sm text-blue-600 font-medium">
                                                  {formatCurrency(detail.price)}
                                                </div>
                                              </div>
                                            </div>
                                        ))}
                                      </div>
                                    </div>
                                )}
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default PaymentHistory;
