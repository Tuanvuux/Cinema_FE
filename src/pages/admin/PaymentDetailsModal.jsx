import React from "react";

const PaymentDetailsModal = ({ payment, onClose, isOpen }) => {
    if (!isOpen) return null;

    // Format functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="border-b p-4 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="text-xl font-bold text-gray-800">
                        Chi tiết giao dịch #{payment.paymentId}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Transaction Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Thông tin giao dịch</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">ID giao dịch</p>
                                <p className="font-medium">{payment.paymentId}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ngày giao dịch</p>
                                <p className="font-medium">{formatDate(payment.dateTransaction)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                                <p className="font-medium">{payment.methodPayment}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng tiền</p>
                                <p className="font-medium text-green-600">{formatCurrency(payment.sumPrice)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Movie Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Thông tin phim</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Tên phim</p>
                                <p className="font-medium">{payment.movieName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">ID lịch chiếu</p>
                                <p className="font-medium">{payment.scheduleId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* User Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Thông tin người dùng</h4>
                        <div>
                            <p className="text-sm text-gray-500">Tên người dùng</p>
                            <p className="font-medium">{payment.username || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Ticket Details */}
                    <div>
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">Chi tiết vé</h4>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                <tr className="bg-gray-50">
                                    <th className="py-2 px-4 border-b text-left">Ghế</th>
                                    <th className="py-2 px-4 border-b text-right">Giá vé</th>
                                </tr>
                                </thead>
                                <tbody>
                                {payment.paymentDetails && payment.paymentDetails.map((detail, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="py-2 px-4 border-b">{detail.seatName || `Ghế ${index + 1}`}</td>
                                        <td className="py-2 px-4 border-b text-right">{formatCurrency(detail.price)}</td>
                                    </tr>
                                ))}
                                {(!payment.paymentDetails || payment.paymentDetails.length === 0) && (
                                    <tr>
                                        <td colSpan="2" className="py-4 text-center text-gray-500">
                                            Chi tiết ghế không có sẵn
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot>
                                <tr className="bg-gray-50 font-medium">
                                    <td className="py-2 px-4 border-t">Tổng cộng ({payment.sumTicket} vé)</td>
                                    <td className="py-2 px-4 border-t text-right text-green-600">{formatCurrency(payment.sumPrice)}</td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t p-4 bg-gray-50 flex justify-end rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsModal;