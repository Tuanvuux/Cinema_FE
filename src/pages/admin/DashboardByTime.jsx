import React, { useEffect, useState ,useRef} from "react";
import { ChevronDown, X, Check } from 'lucide-react';
import UserInfo from "@/pages/admin/UserInfo.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Pie } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale,LinearScale, BarElement, Title, Tooltip, Legend, ArcElement} from 'chart.js';
import { getPayments, getPaymentsByDateRange, getPaymentDetails } from "@/services/apiadmin.jsx";
import PaymentDetailsModal from "@/pages/admin/PaymentDetailsModal.jsx";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,ChartDataLabels);

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

    // Chart view states
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [chartGroupType, setChartGroupType] = useState('quarter');
    const [chartType, setChartType] = useState('pie');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [selectedYears, setSelectedYears] = useState([new Date().getFullYear()]);

    // Danh sách các năm có thể chọn
    const availableYears = [2025, 2024, 2023, 2022, 2021];

    // Xử lý click bên ngoài dropdown để đóng dropdown
    const dropdownRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    useEffect(() => {
        document.title = 'Báo cáo doanh thu theo thời gian';
        fetchPayments();
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleYear = (year) => {
        if (selectedYears.includes(year)) {
            setSelectedYears(selectedYears.filter(y => y !== year));
        } else {
            setSelectedYears([...selectedYears, year]);
        }
    };

    // Xóa một năm đã chọn
    const removeYear = (year, e) => {
        e.stopPropagation(); // Ngăn không cho dropdown mở khi xóa
        setSelectedYears(selectedYears.filter(y => y !== year));
    };


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
            const startDateTime = new Date(startDate);
            startDateTime.setHours(0, 0, 0, 0);

            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);

            const data = await getPaymentsByDateRange(
                startDateTime.toISOString(),
                endDateTime.toISOString()
            );
            setPayments(data);
            setError(null);
        } catch (err) {
            setError('Đã xảy ra lỗi khi tải dữ liệu thanh toán theo khoảng thời gian');
            console.error('Error fetching payments by date range:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeSearch = () => {
        fetchPaymentsByDateRange();
    };

    const handleSeeShowtime = async (payment) => {
        setDetailsLoading(true);
        try {
            const detailedPayment = await getPaymentDetails(payment.paymentId);
            setSelectedPayment(detailedPayment);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching payment details:', err);
            setToast({
                show: true,
                message: 'Không thể tải chi tiết giao dịch',
                type: 'error'
            });
            setTimeout(() => setToast({ ...toast, show: false }), 3000);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    // Filter and pagination logic
    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (payment.movieName?.toLowerCase().includes(searchLower)) ||
            (payment.methodPayment?.toLowerCase().includes(searchLower)) ||
            (payment.username?.toLowerCase().includes(searchLower)) ||
            (payment.paymentId?.toString().includes(searchLower))
        );
    });

    const indexOfLastPayment = currentPage * itemsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    // Chart data preparation - Tách thành 2 hàm riêng cho Pie và Bar
    const prepareChartDataPie = () => {
        let dataToUse;

        if (chartGroupType === 'year') {
            // Lọc theo các năm đã chọn trong trường hợp nhóm theo năm
            dataToUse = filteredPayments.filter(payment => {
                const year = new Date(payment.dateTransaction).getFullYear();
                return selectedYears.includes(year);
            });
        } else {
            // Lọc theo năm đã chọn cho các trường hợp khác
            dataToUse = filteredPayments.filter(payment => {
                return new Date(payment.dateTransaction).getFullYear().toString() === selectedYear;
            });
        }

        if (chartGroupType === 'year') {
            // Nhóm theo năm
            const yearData = {};
            dataToUse.forEach(payment => {
                const year = new Date(payment.dateTransaction).getFullYear().toString();
                yearData[year] = (yearData[year] || 0) + payment.sumPrice;
            });

            // Sắp xếp các năm theo thứ tự giảm dần (mới nhất trước)
            const sortedYears = Object.keys(yearData).sort((a, b) => b - a);

            // Tạo mảng màu với số lượng phù hợp
            const backgroundColors = sortedYears.map((_, i) =>
                `hsla(${(i * 40) % 360}, 70%, 50%, 0.7)`
            );

            const borderColors = backgroundColors.map(color =>
                color.replace('0.7', '1')
            );

            return {
                labels: sortedYears.map(year => `Năm ${year}`),
                datasets: [{
                    data: sortedYears.map(year => yearData[year]),
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            };
        } else if (chartGroupType === 'quarter') {
            // Code nhóm theo quý (giữ nguyên như cũ)
            const quarterData = [0, 0, 0, 0];

            dataToUse.forEach(payment => {
                const month = new Date(payment.dateTransaction).getMonth();
                const quarter = Math.floor(month / 3);
                quarterData[quarter] += payment.sumPrice;
            });

            return {
                labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
                datasets: [{
                    data: quarterData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            };
        } else if (chartGroupType === 'month') {
            // Code nhóm theo tháng (giữ nguyên như cũ)
            const monthData = Array(12).fill(0);

            dataToUse.forEach(payment => {
                const month = new Date(payment.dateTransaction).getMonth();
                monthData[month] += payment.sumPrice;
            });

            return {
                labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
                datasets: [{
                    data: monthData,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(0, 200, 83, 0.7)',
                        'rgba(255, 0, 255, 0.7)',
                        'rgba(0, 0, 255, 0.7)',
                        'rgba(255, 0, 0, 0.7)',
                        'rgba(128, 0, 128, 0.7)',
                        'rgba(165, 42, 42, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(0, 200, 83, 0.7)',
                        'rgba(255, 0, 255, 0.7)',
                        'rgba(0, 0, 255, 0.7)',
                        'rgba(255, 0, 0, 0.7)',
                        'rgba(128, 0, 128, 0.7)',
                        'rgba(165, 42, 42, 0.7)'
                    ],
                    borderWidth: 1
                }]
            };
        }
    };

    const prepareChartDataBar = () => {
        let dataToUse;

        if (chartGroupType === 'year') {
            // Lọc theo các năm đã chọn trong trường hợp nhóm theo năm
            dataToUse = filteredPayments.filter(payment => {
                const year = new Date(payment.dateTransaction).getFullYear();
                return selectedYears.includes(year);
            });
        } else {
            // Lọc theo năm đã chọn cho các trường hợp khác
            dataToUse = filteredPayments.filter(payment => {
                return new Date(payment.dateTransaction).getFullYear().toString() === selectedYear;
            });
        }

        if (chartGroupType === 'year') {
            // Nhóm theo năm
            const yearData = {};
            dataToUse.forEach(payment => {
                const year = new Date(payment.dateTransaction).getFullYear().toString();
                yearData[year] = (yearData[year] || 0) + payment.sumPrice;
            });

            // Sắp xếp các năm theo thứ tự giảm dần (mới nhất trước)
            const sortedYears = Object.keys(yearData).sort((a, b) => b - a);

            return {
                labels: sortedYears.map(year => `Năm ${year}`),
                datasets: [{
                    label: 'Doanh thu theo (VND)',
                    data: sortedYears.map(year => yearData[year]),
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    borderColor: 'rgb(53, 162, 235)',
                    borderWidth: 1
                }]
            };
        } else if (chartGroupType === 'quarter') {
            // Code nhóm theo quý (giữ nguyên như cũ)
            const quarterData = [0, 0, 0, 0];

            dataToUse.forEach(payment => {
                const month = new Date(payment.dateTransaction).getMonth();
                const quarter = Math.floor(month / 3);
                quarterData[quarter] += payment.sumPrice;
            });

            return {
                labels: ['Quý 1', 'Quý 2', 'Quý 3', 'Quý 4'],
                datasets: [{
                    label: `Doanh thu theo quý (VND)`,
                    data: quarterData,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    borderColor: 'rgb(53, 162, 235)',
                    borderWidth: 1
                }]
            };
        } else if (chartGroupType === 'month') {
            // Code nhóm theo tháng (giữ nguyên như cũ)
            const monthData = Array(12).fill(0);

            dataToUse.forEach(payment => {
                const month = new Date(payment.dateTransaction).getMonth();
                monthData[month] += payment.sumPrice;
            });

            return {
                labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
                datasets: [{
                    label: `Doanh thu theo tháng (VND)`,
                    data: monthData,
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    borderColor: 'rgb(53, 162, 235)',
                    borderWidth: 1
                }]
            };
        }
    };


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Doanh thu theo ${chartGroupType === 'quarter' ? 'quý' : chartGroupType === 'month' ? 'tháng' : 'năm'} năm ${selectedYear}`,
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        if (chartType === 'pie') {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                        return `${label}: ${formatCurrency(value)}`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = (value / total * 100).toFixed(1);
                    return `${percentage}%`;
                },
                anchor: 'center',
                align: 'center',
                font: {
                    weight: 'bold',
                    size: 14,
                },
            }
        }
    };


    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const ToastNotification = ({ message, type, show }) => {
        if (!show) return null;

        return (
            <div className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {message}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <ToastNotification {...toast} />

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
                            <span className={`flex items-center ${viewType === 'table' ? 'text-gray-800' : 'text-gray-500'}`}>
                                <span className="relative inline-block w-5 h-5 mr-2 rounded-full border border-gray-400">
                                    {viewType === 'table' && <span className="absolute inset-1 rounded-full bg-indigo-900"></span>}
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
                            <span className={`flex items-center ${viewType === 'chart' ? 'text-gray-800' : 'text-gray-500'}`}>
                                <span className="relative inline-block w-5 h-5 mr-2 rounded-full border border-gray-400">
                                    {viewType === 'chart' && <span className="absolute inset-1 rounded-full bg-indigo-900"></span>}
                                </span>
                                Biểu đồ
                            </span>
                        </label>
                    </div>

                    {viewType === 'table' ? (
                        <div className="flex items-center space-x-6 mb-6 justify-center">
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                className="p-2 border border-gray-300 rounded"
                                dateFormat="dd/MM/yyyy"
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={setEndDate}
                                className="p-2 border border-gray-300 rounded"
                                dateFormat="dd/MM/yyyy"
                                minDate={startDate}
                            />
                            <button
                                onClick={handleDateRangeSearch}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-6 mb-6 justify-center flex-wrap">
                            <div className="flex items-center space-x-2">
                                <span>Nhóm theo:</span>
                                <select
                                    className="p-2 border border-gray-300 rounded"
                                    value={chartGroupType}
                                    onChange={(e) => setChartGroupType(e.target.value)}
                                >
                                    <option value="quarter">Quý</option>
                                    <option value="month">Tháng</option>
                                    <option value="year">Năm</option>
                                </select>
                            </div>

                            {chartGroupType !== 'year' ? (
                                // Hiển thị dropdown chọn một năm khi không phải nhóm theo năm
                                <div className="flex items-center space-x-2">
                                    <span>Năm:</span>
                                    <select
                                        className="p-2 border border-gray-300 rounded"
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {[2025, 2024, 2023, 2022, 2021].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                // Custom dropdown cho phép chọn nhiều năm
                                <div className="flex items-center space-x-2 relative" ref={dropdownRef}>
                                    <span>Chọn năm:</span>
                                    <div className="relative min-w-48">
                                        {/* Dropdown button */}
                                        <div
                                            className="p-2 border border-gray-300 rounded flex items-center justify-between cursor-pointer bg-white min-h-10"
                                            onClick={() => setIsOpen(!isOpen)}
                                        >
                                            {selectedYears.length === 0 ? (
                                                <span className="text-gray-500">Chọn năm</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
                                                    {selectedYears.map(year => (
                                                        <div key={year} className="bg-blue-100 text-blue-800 rounded px-2 py-1 text-sm flex items-center">
                                                            {year}
                                                            <X
                                                                size={14}
                                                                className="ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                                                                onClick={(e) => removeYear(year, e)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <ChevronDown size={18} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {/* Dropdown menu */}
                                        {isOpen && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                                                {availableYears.map(year => (
                                                    <div
                                                        key={year}
                                                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                                                        onClick={() => toggleYear(year)}
                                                    >
                                                        <span>{year}</span>
                                                        {selectedYears.includes(year) && <Check size={16} className="text-blue-600" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <span>Loại biểu đồ:</span>
                                <select
                                    className="p-2 border border-gray-300 rounded"
                                    value={chartType}
                                    onChange={(e) => setChartType(e.target.value)}
                                >
                                    <option value="pie">Tròn</option>
                                    <option value="bar">Cột</option>
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
                        <div className="mt-6 p-4 bg-white rounded-lg shadow-md overflow-hidden">
                            <h2 className="text-xl font-bold mb-4">Biểu đồ doanh thu</h2>
                            <div className="w-full h-96 flex justify-center items-center">
                                {chartType === 'pie' ? (
                                    <Pie data={prepareChartDataPie()} options={chartOptions}/>
                                ) : (
                                    <Bar data={prepareChartDataBar()} options={chartOptions}/>
                                )}
                            </div>

                            {chartGroupType === 'quarter' && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Tổng doanh thu theo quý</h3>
                                    <table className="w-full border-collapse">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 border">Quý</th>
                                            <th className="p-2 border">Doanh thu</th>
                                            <th className="p-2 border">Tỷ lệ</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {prepareChartDataPie().labels.map((label, index) => {
                                            const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                            const value = chartData.datasets[0].data[index];
                                            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                            return (
                                                <tr key={label} className="border">
                                                    <td className="p-2 border text-center">{label}</td>
                                                    <td className="p-2 border text-center">{formatCurrency(value)}</td>
                                                    <td className="p-2 border text-center">{percentage}%</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="p-2 border text-center">Tổng cộng</td>
                                            <td className="p-2 border text-center">
                                                {formatCurrency(
                                                    (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                        .datasets[0].data.reduce((a, b) => a + b, 0)
                                                )}
                                            </td>
                                            <td className="p-2 border text-center">100%</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {chartGroupType === 'month' && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Tổng doanh thu theo tháng</h3>
                                    <table className="w-full border-collapse">
                                        <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-2 border">Tháng</th>
                                            <th className="p-2 border">Doanh thu</th>
                                            <th className="p-2 border">Tỷ lệ</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {prepareChartDataPie().labels.map((label, index) => {
                                            const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                            const value = chartData.datasets[0].data[index];
                                            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                            return (
                                                <tr key={label} className="border">
                                                    <td className="p-2 border text-center">{label}</td>
                                                    <td className="p-2 border text-center">{formatCurrency(value)}</td>
                                                    <td className="p-2 border text-center">{percentage}%</td>
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="p-2 border text-center">Tổng cộng</td>
                                            <td className="p-2 border text-center">
                                                {formatCurrency(
                                                    (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                        .datasets[0].data.reduce((a, b) => a + b, 0)
                                                )}
                                            </td>
                                            <td className="p-2 border text-center">100%</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {chartGroupType === 'year' && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-2">Tổng doanh thu theo năm</h3>
                                    {selectedYears.length > 0 ? (
                                        <table className="w-full border-collapse">
                                            <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 border">Năm</th>
                                                <th className="p-2 border">Doanh thu</th>
                                                <th className="p-2 border">Tỷ lệ</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {prepareChartDataPie().labels.map((label, index) => {
                                                const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                                const value = chartData.datasets[0].data[index];
                                                const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                                return (
                                                    <tr key={label} className="border">
                                                        <td className="p-2 border text-center">{label}</td>
                                                        <td className="p-2 border text-center">{formatCurrency(value)}</td>
                                                        <td className="p-2 border text-center">{percentage}%</td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-gray-50 font-semibold">
                                                <td className="p-2 border text-center">Tổng cộng</td>
                                                <td className="p-2 border text-center">
                                                    {formatCurrency(
                                                        (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                            .datasets[0].data.reduce((a, b) => a + b, 0)
                                                    )}
                                                </td>
                                                <td className="p-2 border text-center">100%</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-center text-gray-500">Vui lòng chọn ít nhất một năm để hiển thị dữ liệu</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}