import React from "react";

const PaymentDetailsModal = ({ payment, onClose, isOpen }) => {
    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN");
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="border-b p-5 flex justify-between items-center bg-gray-100 rounded-t-2xl">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        Chi tiết giao dịch #{payment.paymentId}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-red-500 transition-colors duration-200"
                    >
                        <span className="material-icons text-3xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 text-sm text-gray-700">
                    {/* Transaction Information */}
                    <section>
                        <h4 className="text-lg font-bold mb-3 text-gray-700 border-b pb-2">Thông tin giao dịch</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Info label="ID giao dịch" value={payment.paymentId} />
                            <Info label="Ngày giao dịch" value={formatDate(payment.dateTransaction)} />
                            <Info label="Phương thức thanh toán" value={payment.methodPayment} />
                            <Info
                                label="Tổng tiền"
                                value={formatCurrency(payment.sumPrice)}
                                highlight="text-green-600"
                            />
                        </div>
                    </section>

                    {/* Movie Information */}
                    <section>
                        <h4 className="text-lg font-bold mb-3 text-gray-700 border-b pb-2">Thông tin phim</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <Info label="Tên phim" value={payment.movieName || "N/A"} />
                            <Info label="ID lịch chiếu" value={payment.scheduleId || "N/A"} />
                            <Info label="Phòng" value={payment.roomName || "N/A"} />
                        </div>
                    </section>

                    {/* User Information */}
                    <section>
                        <h4 className="text-lg font-bold mb-3 text-gray-700 border-b pb-2">Thông tin người dùng</h4>
                        <Info label="Tên người dùng" value={payment.username || "N/A"} />
                    </section>

                    {/* Ticket Details */}
                    <section>
                        <h4 className="text-lg font-bold mb-3 text-gray-700 border-b pb-2">Chi tiết vé</h4>
                        <div className="overflow-x-auto rounded-lg border">
                            <table className="min-w-full bg-white text-sm">
                                <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="py-2 px-4 border-b">Ghế</th>
                                    <th className="py-2 px-4 border-b text-right">Giá vé</th>
                                </tr>
                                </thead>
                                <tbody>
                                {payment.paymentDetails && payment.paymentDetails.length > 0 ? (
                                    payment.paymentDetails.map((detail, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition">
                                            <td className="py-2 px-4 border-b">{detail.seatName || `Ghế ${index + 1}`}</td>
                                            <td className="py-2 px-4 border-b text-right">
                                                {formatCurrency(detail.price)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="py-4 text-center text-gray-400">
                                            Chi tiết ghế không có sẵn
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot>
                                <tr className="bg-gray-100 font-medium">
                                    <td className="py-2 px-4 border-t">
                                        Tổng cộng ({payment.sumTicket} vé)
                                    </td>
                                    <td className="py-2 px-4 border-t text-right text-green-600">
                                        {formatCurrency(payment.sumPrice)}
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-100 flex justify-end rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-5 rounded-lg transition"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Subcomponent for displaying label-value pairs
const Info = ({ label, value, highlight = "text-gray-800" }) => (
    <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`font-medium mt-1 ${highlight}`}>{value}</p>
    </div>
);

export default PaymentDetailsModal;
