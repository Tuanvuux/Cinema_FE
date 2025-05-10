import React, { useEffect, useState } from "react";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { getPayments, getPaymentsByDateRange, getPaymentDetails} from "@/services/apiadmin.jsx";
import PaymentDetailsModal from "@/pages/admin/PaymentDetailsModal.jsx";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashBoardByTime() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [payments, setPayments] = useState([]);

    const [viewType, setViewType] = useState('table');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // Add state for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        document.title = 'Báo cáo doanh thu theo thời gian';
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getPayments();
            setPayments(data);
            setError(null);
        } catch (err) {
            setError('Đã xảy ra lỗi khi tải dữ liệu thanh toán');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPaymentsByDateRange = async () => {
        setLoading(true);
        try {
            // Create startDate at beginning of day (00:00:00)
            const startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0);

            // Create endDate at end of day (23:59:59)
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            // Format dates for API call using ISO format
            const formattedStartDate = startDateTime.toISOString();
            const formattedEndDate = endDateTime.toISOString();

            console.log("Sending date range request with:", {
                startDate: formattedStartDate,  // Note: variable name matches Spring parameter name
                endDate: formattedEndDate       // Note: variable name matches Spring parameter name
            });

            const data = await getPaymentsByDateRange(formattedStartDate, formattedEndDate);
            setPayments(data);
            setError(null);
        } catch (err) {
            setError('Đã xảy ra lỗi khi tải dữ liệu thanh toán theo khoảng thời gian');
            console.error('Error fetching payments by date range:', err);
            // Add detailed error logging
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
                console.error('Response headers:', err.response.headers);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeSearch = () => {
        fetchPaymentsByDateRange();
    };

    // New function to handle viewing payment details
    const handleSeeShowtime = async (payment) => {
        setDetailsLoading(true);
        try {
            // Fetch full payment details including seats
            const detailedPayment = await getPaymentDetails(payment.paymentId);
            console.log('Payment details data:', detailedPayment);
            setSelectedPayment(detailedPayment);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching payment details:', err);
            setToast({
                show: true,
                message: 'Không thể tải chi tiết giao dịch',
                type: 'error'
            });
            // Show toast for 3 seconds
            setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 3000);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    // Filter payments based on search term
    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (payment.movieName && payment.movieName.toLowerCase().includes(searchLower)) ||
            (payment.methodPayment && payment.methodPayment.toLowerCase().includes(searchLower)) ||
            (payment.username && payment.username.toLowerCase().includes(searchLower)) ||
            (payment.paymentId && payment.paymentId.toString().includes(searchLower))
        );
    });

    // Pagination logic
    const indexOfLastPayment = currentPage * itemsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    // Generate chart data
    const prepareChartData = () => {
        // Group by date and calculate daily sum
        const dailyData = {};

        filteredPayments.forEach(payment => {
            const date = new Date(payment.dateTransaction).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += payment.sumPrice;
        });

        return {
            labels: Object.keys(dailyData),
            datasets: [
                {
                    label: 'Doanh thu theo ngày (VND)',
                    data: Object.values(dailyData),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    borderColor: 'rgb(53, 162, 235)',
                    borderWidth: 1,
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ doanh thu theo thời gian',
            },
        },
    };

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const ToastNotification = ({ message, type, show }) => {
        if (!show) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0
                }}
            >
                {message}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
            />

            {/* Payment Details Modal */}
            {selectedPayment && (
                <PaymentDetailsModal
                    payment={selectedPayment}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            )}

            <div className="flex h-full">
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">BÁO CÁO DOANH THU THEO THỜI GIAN</h1>
                        <div className="flex items-center">
                            <div className="relative mr-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm giao dịch"
                                    className="border rounded-md py-2 px-4 pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                            </div>
                            <UserInfo/>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 justify-center mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="viewType"
                                value="table"
                                checked={viewType === 'table'}
                                onChange={() => setViewType('table')}
                                className="hidden"
                            />
                            <span
                                className={`flex items-center ${viewType === 'table' ? 'text-gray-800' : 'text-gray-500'}`}>
                                    <span
                                        className="relative inline-block w-5 h-5 mr-2 rounded-full border border-gray-400">
                                        {viewType === 'table' && (
                                            <span className="absolute inset-1 rounded-full bg-indigo-900"></span>
                                        )}
                                    </span>
                                    Bảng
                                </span>
                        </label>

                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="viewType"
                                value="chart"
                                checked={viewType === 'chart'}
                                onChange={() => setViewType('chart')}
                                className="hidden"
                            />
                            <span
                                className={`flex items-center ${viewType === 'chart' ? 'text-gray-800' : 'text-gray-500'}`}>
                                    <span
                                        className="relative inline-block w-5 h-5 mr-2 rounded-full border border-gray-400">
                                        {viewType === 'chart' && (
                                            <span className="absolute inset-1 rounded-full bg-indigo-900"></span>
                                        )}
                                    </span>
                                    Biểu đồ
                                </span>
                        </label>
                    </div>

                    {viewType === 'table' ? (
                        <div className="flex items-center space-x-6 mb-6 justify-center">
                            <div className="flex items-center">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    className="p-2 border border-gray-300 rounded"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>

                            <div className="flex items-center">
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    className="p-2 border border-gray-300 rounded"
                                    dateFormat="dd/MM/yyyy"
                                    minDate={startDate}
                                />
                            </div>

                            <button
                                onClick={handleDateRangeSearch}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-6 mb-6 justify-center">
                            <div className="flex items-center space-x-2">
                                <span>Chọn những năm hiển thị (nếu chọn năm)</span>
                                <select
                                    className="p-2 border border-gray-300 rounded"
                                    onChange={(e) => handleYearChange(e.target.value)}
                                >
                                    <option value="2024">2024</option>
                                    <option value="2023">2023</option>
                                    <option value="2022">2022</option>
                                    <option value="2021">2021</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <select
                                    className="p-2 border border-gray-300 rounded"
                                    onChange={(e) => handleViewTypeChange(e.target.value)}
                                >
                                    <option value="year">Năm</option>
                                    <option value="month">Tháng</option>
                                    <option value="day">Ngày</option>
                                </select>
                            </div>
                        </div>
                    )}


                    {loading ? (
                        <div className="text-center py-10">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : viewType === 'table' ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border">
                                    <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="p-3 text-center">ID</th>
                                        <th className="p-3 text-center">Tên phim</th>
                                        <th className="p-3 text-center">Ngày giao dịch</th>
                                        <th className="p-3 text-center">Ghế</th>
                                        <th className="p-3 text-center">ID lịch chiếu</th>
                                        <th className="p-3 text-center">Số vé</th>
                                        <th className="p-3 text-center">Doanh thu</th>
                                        <th className="p-3 text-center">Phương thức thanh toán</th>
                                        <th className="p-3 text-center">Thao tác</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentPayments.map((payment) => (
                                        <tr key={payment.paymentId} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-center">{payment.paymentId}</td>
                                            <td className="p-3 font-medium text-center">{payment.movieName || 'N/A'}</td>
                                            <td className="p-3 text-center">
                                                {new Date(payment.dateTransaction).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-3 text-center">{payment.seatNames || 'N/A'}</td>
                                            <td className="p-3 text-center">{payment.scheduleId || 'N/A'}</td>
                                            {/* This represents showtimeId */}
                                            <td className="p-3 text-center">{payment.sumTicket}</td>
                                            <td className="p-3 text-center">{formatCurrency(payment.sumPrice)}</td>
                                            <td className="p-3 text-center">{payment.methodPayment}</td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => handleSeeShowtime(payment)}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    disabled={detailsLoading}
                                                >
                                                    <span className="material-icons">
                                                        {detailsLoading ? "hourglass_empty" : "visibility"}
                                                    </span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center mt-6">
                                <nav>
                                    <ul className="flex items-center">
                                        <li>
                                            <button
                                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-3 py-1 mx-1 border rounded ${
                                                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                &laquo;
                                            </button>
                                        </li>
                                        {Array.from({length: Math.ceil(filteredPayments.length / itemsPerPage)}).map((_, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-3 py-1 mx-1 border rounded ${
                                                        currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            </li>
                                        ))}
                                        <li>
                                            <button
                                                onClick={() => paginate(Math.min(Math.ceil(filteredPayments.length / itemsPerPage), currentPage + 1))}
                                                disabled={currentPage === Math.ceil(filteredPayments.length / itemsPerPage)}
                                                className={`px-3 py-1 mx-1 border rounded ${
                                                    currentPage === Math.ceil(filteredPayments.length / itemsPerPage)
                                                        ? 'bg-gray-100 text-gray-400'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                                <h2 className="text-lg font-bold mb-2">Tổng kết:</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white p-4 rounded shadow">
                                        <h3 className="text-gray-500 text-sm">Tổng số giao dịch</h3>
                                        <p className="text-2xl font-bold">{filteredPayments.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded shadow">
                                        <h3 className="text-gray-500 text-sm">Tổng số vé</h3>
                                        <p className="text-2xl font-bold">
                                            {filteredPayments.reduce((sum, payment) => sum + payment.sumTicket, 0)}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded shadow">
                                        <h3 className="text-gray-500 text-sm">Tổng doanh thu</h3>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.sumPrice, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
                            <h2 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h2>
                            <div className="w-full flex-grow">
                                <Bar data={prepareChartData()} options={chartOptions}/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}