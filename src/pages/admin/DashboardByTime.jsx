    import React, { useEffect, useState, useRef } from "react";
import {
    ChevronDown,
    X,
    Check,
    FileText,
    FileSpreadsheet,
    Search,
    Calendar,
    BarChart,
    PieChart,
    RefreshCw,
    CheckCircle, AlertCircle
} from 'lucide-react';
import UserInfo from "@/pages/admin/UserInfo.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { getPayments, getPaymentsByDateRange, getPaymentDetails } from "@/services/apiadmin.jsx";
import PaymentDetailsModal from "@/pages/admin/PaymentDetailsModal.jsx";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
    import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";


// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

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
    const [toast, setToast] = useState([]);
    const ContentRef = useRef(null);

    const addToast = (message, type = 'success') => {
        const id = Date.now(); // Tạo ID duy nhất cho mỗi toast
        setToast(prev => [...prev, { id, message, type, show: true }]);

        // Tự động xóa toast sau 3 giây
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Hàm xóa toast
    const removeToast = (id) => {
        setToast(prev => prev.map(t =>
            t.id === id ? { ...t, show: false } : t
        ));

        // Xóa toast khỏi mảng sau khi animation kết thúc
        setTimeout(() => {
            setToast(prev => prev.filter(t => t.id !== id));
        }, 300);
    };

    // Component Toast Container để hiển thị nhiều toast
    const ToastContainer = () => {
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toast.map((t) => (
                    <ToastNotification
                        key={t.id}
                        id={t.id}
                        message={t.message}
                        type={t.type}
                        show={t.show}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        );
    };

    // Component Toast Notification cập nhật
    const ToastNotification = ({ id, message, type, show, onClose }) => {
        if (!show) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`px-6 py-3 rounded-md shadow-lg flex items-center justify-between ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
            >
                <div className="flex items-center">
                    {type === 'success' ?
                        <CheckCircle className="mr-2 h-5 w-5 text-white" /> :
                        <AlertCircle className="mr-2 h-5 w-5 text-white" />
                    }
                    <p className="text-white font-medium">{message}</p>
                </div>
                <button
                    className="text-white opacity-70 hover:opacity-100"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    };

    // Toast notification


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
            addToast('Dữ liệu đã được cập nhật theo khoảng thời gian','success')


        } catch (err) {
            setError('Đã xảy ra lỗi khi tải dữ liệu thanh toán theo khoảng thời gian');
            console.error('Error fetching payments by date range:', err);
            addToast('Lỗi khi tải dữ liệu','error')

        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeSearch = () => {
        fetchPaymentsByDateRange();
    };
    const handlePaymentSearch = () => {
        fetchPayments();
    };

    const handleSeeShowtime = async (payment) => {
        setDetailsLoading(true);
        try {
            const detailedPayment = await getPaymentDetails(payment.paymentId);
            setSelectedPayment(detailedPayment);
            setIsModalOpen(true);
        } catch (err) {
            console.error('Error fetching payment details:', err);
            addToast('Không thể tải chi tiết giao dịch','error')
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPayment(null);
    };

    const handleExportPDF = async () => {
        try {
            // Tạo HTML table tạm thời
            const tableElement = document.createElement('div');
            tableElement.style.fontFamily = 'Arial, sans-serif';
            tableElement.style.padding = '20px';
            tableElement.style.backgroundColor = 'white';
            tableElement.style.width = '800px';

            // Tính tổng
            const totalTransactions = filteredPayments.length;
            const totalTickets = filteredPayments.reduce((sum, p) => sum + p.sumTicket, 0);
            const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.sumPrice, 0);

            tableElement.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #2c3e50; margin: 0;">BÁO CÁO DOANH THU</h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                    <tr style="background-color: #2980b9; color: white;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">ID</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Tên phim</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Ngày giao dịch</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Ghế</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Lịch chiếu</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Số vé</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Doanh thu</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Phương thức</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPayments.map((payment, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${payment.paymentId}</td>
                            <td style="border: 1px solid #ddd; padding: 6px;">${payment.movieName || "N/A"}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${new Date(payment.dateTransaction).toLocaleString("vi-VN")}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${payment.seatNames || "N/A"}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${payment.scheduleId || "N/A"}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${payment.sumTicket}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${formatCurrency(payment.sumPrice)}</td>
                            <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${payment.methodPayment}</td>
                        </tr>
                    `).join('')}
                    <tr style="background-color: #e8f4fd; font-weight: bold;">
                        <td colspan="5" style="border: 1px solid #ddd; padding: 8px; text-align: right;">TỔNG CỘNG:</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totalTickets}</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(totalRevenue)}</td>
                        <td style="border: 1px solid #ddd; padding: 8px;"></td>
                    </tr>
                </tbody>
            </table>
            <div style="margin-top: 20px; font-size: 14px;">
                <p><strong>Tổng giao dịch:</strong> ${totalTransactions}</p>
                <p><strong>Xuất báo cáo lúc:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            </div>
        `;

            // Thêm vào DOM tạm thời (ẩn)
            tableElement.style.position = 'absolute';
            tableElement.style.left = '-9999px';
            tableElement.style.top = '0';
            document.body.appendChild(tableElement);

            // Chụp ảnh bằng html2canvas
            const canvas = await html2canvas(tableElement, {
                scale: 2, // Tăng độ phân giải
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            // Xóa element tạm thời
            document.body.removeChild(tableElement);

            // Tạo PDF từ canvas
            const imgData = canvas.toDataURL('image/png');
            const doc = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // Margin 10mm mỗi bên
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 10; // Margin top

            // Thêm ảnh vào PDF, chia trang nếu cần
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20); // Trừ margin

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeight - 20);
            }

            doc.save("bao_cao_doanh_thu.pdf");
            addToast('Đã xuất file PDF thành công', 'success');

        } catch (error) {
            console.error('Lỗi xuất PDF:', error);
            addToast('Lỗi xuất file PDF', 'error');
        }
    };

    const handleExportExcel = () => {
        const worksheetData = filteredPayments.map(payment => ({
            "ID": payment.paymentId,
            "Tên phim": payment.movieName || "N/A",
            "Ngày giao dịch": new Date(payment.dateTransaction).toLocaleString("vi-VN"),
            "Ghế": payment.seatNames || "N/A",
            "Lịch chiếu": payment.scheduleId || "N/A",
            "Số vé": payment.sumTicket,
            "Doanh thu (VND)": payment.sumPrice,
            "Phương thức thanh toán": payment.methodPayment,
            "Tổng kết": "", // Cột để hiển thị dòng tổng sau này
        }));

        // Tính tổng
        const totalTransactions = filteredPayments.length;
        const totalTickets = filteredPayments.reduce((sum, p) => sum + p.sumTicket, 0);
        const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.sumPrice, 0);

        // Thêm dòng tổng kết
        worksheetData.push({
            "ID": "",
            "Tên phim": "",
            "Ngày giao dịch": "",
            "Ghế": "",
            "Lịch chiếu": "",
            "Số vé": totalTickets,
            "Doanh thu (VND)": totalRevenue,
            "Phương thức thanh toán": "",
            "Tổng kết": `TỔNG CỘNG (${totalTransactions} giao dịch)`
        });

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo doanh thu");

        XLSX.writeFile(workbook, "bao_cao_doanh_thu.xlsx");
        addToast('Đã xuất file Excel thành công','success')
    };

    // Filter and pagination logic
    // const filteredPayments = payments.filter(payment => {
    //     const searchLower = searchTerm.toLowerCase();
    //     return (
    //         (payment.movieName?.toLowerCase().includes(searchLower)) ||
    //         (payment.methodPayment?.toLowerCase().includes(searchLower)) ||
    //         (payment.username?.toLowerCase().includes(searchLower)) ||
    //         (payment.paymentId?.toString().includes(searchLower))
    //     );
    // });
    const filteredPayments = payments.filter((payment) =>
        Object.values(payment).some((value) =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

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
                `hsla(${(i * 40) % 360}, 70%, 50%, 0.8)`
            );

            const borderColors = backgroundColors.map(color =>
                color.replace('0.8', '1')
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
                        'rgba(53, 162, 235, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 205, 86, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgb(53, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(255, 99, 132)'
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

            // Gradient colors for months
            const backgroundColors = Array(12).fill().map((_, i) =>
                `hsla(${210 + (i * 12) % 360}, 70%, 60%, 0.8)`
            );

            const borderColors = backgroundColors.map(color =>
                color.replace('0.8', '1')
            );

            return {
                labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
                datasets: [{
                    data: monthData,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
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
                    label: 'Doanh thu (VND)',
                    data: sortedYears.map(year => yearData[year]),
                    backgroundColor: 'rgba(53, 162, 235, 0.7)',
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
                    backgroundColor: [
                        'rgba(53, 162, 235, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 205, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgb(53, 162, 235)',
                        'rgb(75, 192, 192)',
                        'rgb(255, 205, 86)',
                        'rgb(255, 99, 132)'
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

            // Create a gradient of colors
            const backgroundColors = Array(12).fill().map((_, i) =>
                `rgba(53, ${120 + (i * 10)}, 235, 0.7)`
            );

            return {
                labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
                datasets: [{
                    label: `Doanh thu theo tháng (VND)`,
                    data: monthData,
                    backgroundColor: backgroundColors,
                    borderColor: 'rgb(53, 162, 235)',
                    borderWidth: 1
                }]
            };
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: `Doanh thu theo ${chartGroupType === 'quarter' ? 'quý' : chartGroupType === 'month' ? 'tháng' : 'năm'} ${chartGroupType !== 'year' ? 'năm ' + selectedYear : ''}`,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
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
                },
                padding: 12,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: {
                    size: 14
                },
                bodyFont: {
                    size: 14
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
                textShadow: true,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <ToastContainer />
            <ScrollToTopButton containerRef={ContentRef} />
            {selectedPayment && (
                <PaymentDetailsModal
                    payment={selectedPayment}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            )}

            <div  className="flex flex-col md:flex-row h-full">
                <div ref={ContentRef} className="flex-1 p-6 overflow-auto">
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">BÁO CÁO DOANH THU THEO THỜI
                            GIAN</h1>
                        <div
                            className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4">
                            {viewType === 'table' && (
                                <div className="relative w-full md:w-64">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm giao dịch"
                                        className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"/>
                                </div>
                            )}
                            <UserInfo className="w-full md:w-auto"/>
                        </div>
                    </div>

                    <div
                        className="flex flex-wrap items-center space-x-4 justify-center mb-8 bg-white p-4 rounded-lg shadow-sm">
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
                                className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${viewType === 'table' ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <span className="material-icons mr-2">table_chart</span>
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
                                className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${viewType === 'chart' ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <span className="material-icons mr-2">insert_chart</span>
                                Biểu đồ
                            </span>
                        </label>
                    </div>

                    {viewType === 'table' ? (
                        <div
                            className="flex flex-wrap items-center mb-6 justify-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-800"/>
                                <span className="font-medium">Từ:</span>
                                <DatePicker
                                    selected={startDate}
                                    onChange={setStartDate}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-indigo-800"/>
                                <span className="font-medium">Đến:</span>
                                <DatePicker
                                    selected={endDate}
                                    onChange={setEndDate}
                                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-200"
                                    dateFormat="dd/MM/yyyy"
                                    minDate={startDate}
                                />
                            </div>
                            <button
                                onClick={handleDateRangeSearch}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                            >
                                <Search className="h-5 w-5 mr-2"/>
                                Tìm kiếm
                            </button>
                            <button
                                onClick={handlePaymentSearch}
                                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 shadow flex items-center justify-center"
                                title="Tải lại"
                            >
                                <RefreshCw className="h-4 w-4 text-gray-700"/>
                            </button>
                            <div className="flex gap-4 ml-auto flex-wrap">
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center bg-red-600 text-white px-3 py-2 rounded shadow hover:bg-red-700 transition min-w-[120px] justify-center"
                                >
                                    <FileText className="w-5 h-5 mr-2"/>
                                    Xuất PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="flex items-center bg-green-600 text-white px-3 py-2 rounded shadow hover:bg-green-700 transition min-w-[120px] justify-center"
                                >
                                    <FileSpreadsheet className="w-5 h-5 mr-2"/>
                                    Xuất Excel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center space-x-4 mb-8 justify-center">
                            <select
                                className="p-2.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-400 appearance-none bg-no-repeat bg-right bg-[length:16px_16px]"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 8px center'
                                }}
                                value={chartGroupType}
                                onChange={(e) => setChartGroupType(e.target.value)}
                            >
                                <option value="quarter">Quý</option>
                                <option value="month">Tháng</option>
                                <option value="year">Năm</option>
                            </select>

                            {chartGroupType !== 'year' ? (
                                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                                    <span className="text-gray-700 font-medium">Năm:</span>
                                    <select
                                        className="p-2.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-400 appearance-none bg-no-repeat bg-right bg-[length:16px_16px]"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 8px center'
                                        }}
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                    >
                                        {[2025, 2024, 2023, 2022, 2021].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 relative mb-4 sm:mb-0" ref={dropdownRef}>
                                    <span className="text-gray-700 font-medium">Chọn năm:</span>
                                    <div className="relative min-w-48">
                                        <div
                                            className="p-2.5 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer bg-white min-h-10 hover:border-blue-400 transition-all duration-200 shadow-sm"
                                            onClick={() => setIsOpen(!isOpen)}
                                        >
                                            {selectedYears.length === 0 ? (
                                                <span className="text-gray-500">Chọn năm</span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
                                                    {selectedYears.map(year => (
                                                        <div key={year}
                                                             className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm flex items-center transition-all duration-200 hover:bg-blue-200">
                                                            {year}
                                                            <X
                                                                size={16}
                                                                className="ml-1.5 cursor-pointer text-blue-600 hover:text-blue-800"
                                                                onClick={(e) => removeYear(year, e)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <ChevronDown size={18}
                                                         className={`ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                                        </div>

                                        {isOpen && (
                                            <div
                                                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-200 origin-top">
                                                {availableYears.map(year => (
                                                    <div
                                                        key={year}
                                                        className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors duration-150"
                                                        onClick={() => toggleYear(year)}
                                                    >
                                                        <span>{year}</span>
                                                        {selectedYears.includes(year) &&
                                                            <Check size={18} className="text-blue-600"/>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                                <span className="text-gray-700 font-medium">Loại biểu đồ:</span>
                                <select
                                    className="p-2.5 pr-8 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-400 appearance-none bg-no-repeat bg-right bg-[length:16px_16px]"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 8px center'
                                    }}
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
                        <div className="text-center py-16 flex flex-col items-center justify-center">
                            <div
                                className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-lg text-gray-600 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-16 bg-red-50 rounded-lg border border-red-200">
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                                <span className="material-icons text-3xl">error_outline</span>
                            </div>
                            <p className="text-red-600 text-lg font-medium">{error}</p>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
                            <span className="material-icons text-5xl text-gray-400 mb-3">receipt_long</span>
                            <h3 className="text-xl font-medium text-gray-700 mb-1">Không tìm thấy giao dịch</h3>
                            <p className="text-gray-500">Không có giao dịch nào phù hợp với tiêu chí tìm kiếm</p>
                        </div>
                    ) : viewType === 'table' ? (
                        <>
                            <div
                                className="overflow-x-auto max-w-full bg-white rounded-xl shadow-md border border-gray-100">
                                <table className="min-w-full bg-white">
                                    <thead>
                                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">ID</th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Tên phim
                                        </th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Ngày giao
                                            dịch
                                        </th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Ghế</th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">ID lịch
                                            chiếu
                                        </th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Số vé</th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Doanh thu
                                        </th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Phương thức
                                            thanh toán
                                        </th>
                                        <th className="p-4 text-center text-sm font-semibold text-gray-700">Thao tác
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {currentPayments.map((payment, index) => (
                                        <tr key={payment.paymentId}
                                            className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="p-4 text-center text-gray-800">{payment.paymentId}</td>
                                            <td className="p-4 font-medium text-center text-gray-800">{payment.movieName || 'N/A'}</td>
                                            <td className="p-4 text-center text-gray-700">
                                                {new Date(payment.dateTransaction).toLocaleString('vi-VN')}
                                            </td>
                                            <td className="p-4 text-center text-gray-700">{payment.seatNames || 'N/A'}</td>
                                            <td className="p-4 text-center text-gray-700">{payment.scheduleId || 'N/A'}</td>
                                            <td className="p-4 text-center text-gray-700">{payment.sumTicket}</td>
                                            <td className="p-4 text-center font-medium text-green-700">{formatCurrency(payment.sumPrice)}</td>
                                            <td className="p-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                payment.methodPayment === 'VNPAY' ? 'bg-blue-100 text-blue-800' :
                                    payment.methodPayment === 'CASH' ? 'bg-green-100 text-green-800' :
                                        'bg-purple-100 text-purple-800'
                            }`}>
                                {payment.methodPayment}
                            </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleSeeShowtime(payment)}
                                                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-full hover:bg-blue-100"
                                                    disabled={detailsLoading}
                                                    title="Xem chi tiết"
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
                            <div className="flex justify-center mt-8">
                                <nav className="w-full overflow-x-auto flex justify-center">
                                    <ul className="flex space-x-1">
                                        <li>
                                            <button
                                                onClick={() => paginate(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                                                    currentPage === 1
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                                                }`}
                                            >
                                                &laquo;
                                            </button>
                                        </li>
                                        {Array.from({length: Math.ceil(filteredPayments.length / itemsPerPage)}).map((_, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => paginate(index + 1)}
                                                    className={`px-4 py-2 mx-1 border rounded-md transition-all duration-200 ${
                                                        currentPage === index + 1
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
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
                                                className={`px-4 py-2 rounded-md border transition-all duration-200 ${
                                                    currentPage === Math.ceil(filteredPayments.length / itemsPerPage)
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                                                }`}
                                            >
                                                &raquo;
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>

                            <div
                                className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-md border border-gray-200">
                                <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                                    <span className="material-icons mr-2 text-blue-600">summarize</span>
                                    Tổng kết
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div
                                        className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
                                        <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng số giao dịch</h3>
                                        <p className="text-3xl font-bold text-gray-800">{filteredPayments.length}</p>
                                    </div>
                                    <div
                                        className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
                                        <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng số vé</h3>
                                        <p className="text-3xl font-bold text-gray-800">
                                            {filteredPayments.reduce((sum, payment) => sum + payment.sumTicket, 0)}
                                        </p>
                                    </div>
                                    <div
                                        className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 transform hover:-translate-y-1">
                                        <h3 className="text-gray-500 text-sm font-medium mb-2">Tổng doanh thu</h3>
                                        <p className="text-3xl font-bold text-green-600">
                                            {formatCurrency(filteredPayments.reduce((sum, payment) => sum + payment.sumPrice, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div
                            className="mt-6 p-6 bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
                            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
                                <span className="material-icons mr-2 text-blue-600">bar_chart</span>
                                Biểu đồ doanh thu
                            </h2>
                            <div
                                className="w-full max-w-screen-md h-96 mx-auto flex justify-center items-center bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                                {chartType === 'pie' ? (
                                    <Pie data={prepareChartDataPie()} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                position: 'right',
                                                labels: {
                                                    font: {
                                                        size: 12,
                                                        family: "'Roboto', sans-serif"
                                                    },
                                                    padding: 20,
                                                    usePointStyle: true,
                                                    boxWidth: 10
                                                }
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                titleFont: {
                                                    size: 14,
                                                    family: "'Roboto', sans-serif"
                                                },
                                                bodyFont: {
                                                    size: 13,
                                                    family: "'Roboto', sans-serif"
                                                },
                                                bodyColor: '#333',
                                                titleColor: '#333',
                                                borderColor: '#ddd',
                                                borderWidth: 1,
                                                boxPadding: 5,
                                                usePointStyle: true,
                                            }
                                        },
                                        animation: {
                                            animateScale: true,
                                            animateRotate: true,
                                            duration: 1000,
                                            easing: 'easeOutQuart'
                                        }
                                    }}/>
                                ) : (
                                    <Bar data={prepareChartDataBar()} options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                titleFont: {
                                                    size: 14,
                                                    family: "'Roboto', sans-serif"
                                                },
                                                bodyFont: {
                                                    size: 13,
                                                    family: "'Roboto', sans-serif"
                                                },
                                                bodyColor: '#333',
                                                titleColor: '#333',
                                                borderColor: '#ddd',
                                                borderWidth: 1,
                                                boxPadding: 5
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: {
                                                    color: 'rgba(0, 0, 0, 0.05)'
                                                },
                                                ticks: {
                                                    font: {
                                                        family: "'Roboto', sans-serif"
                                                    }
                                                }
                                            },
                                            x: {
                                                grid: {
                                                    display: false
                                                },
                                                ticks: {
                                                    font: {
                                                        family: "'Roboto', sans-serif"
                                                    }
                                                }
                                            }
                                        },
                                        animation: {
                                            duration: 1000,
                                            easing: 'easeOutQuart'
                                        }
                                    }}/>
                                )}
                            </div>

                            {chartGroupType === 'quarter' && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                        <span className="material-icons mr-2 text-blue-600 text-xl">view_week</span>
                                        Tổng doanh thu theo quý
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Quý</th>
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Doanh
                                                    thu
                                                </th>
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Tỷ
                                                    lệ
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {prepareChartDataPie().labels.map((label, index) => {
                                                const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                                const value = chartData.datasets[0].data[index];
                                                const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                                return (
                                                    <tr key={label}
                                                        className="hover:bg-blue-50 transition-colors duration-150">
                                                        <td className="p-3 border border-blue-100 text-center font-medium text-gray-700">{label}</td>
                                                        <td className="p-3 border border-blue-100 text-center text-gray-800">{formatCurrency(value)}</td>
                                                        <td className="p-3 border border-blue-100 text-center">
                                                            <div className="flex items-center justify-center pl-4">
                                                                <div
                                                                    className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                                        style={{width: `${percentage}%`}}
                                                                    ></div>
                                                                </div>
                                                                <span
                                                                    className="text-gray-700 w-12 text-left">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold">
                                            <td className="p-3 border border-blue-100 text-center text-gray-800">Tổng
                                                    cộng
                                                </td>
                                                <td className="p-3 border border-blue-100 text-center text-green-700">
                                                    {formatCurrency(
                                                        (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                            .datasets[0].data.reduce((a, b) => a + b, 0)
                                                    )}
                                                </td>
                                                <td className="p-3 border border-blue-100 text-center text-gray-800">100%</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {chartGroupType === 'month' && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                        <span
                                            className="material-icons mr-2 text-blue-600 text-xl">calendar_today</span>
                                        Tổng doanh thu theo tháng
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse rounded-lg overflow-hidden">
                                            <thead>
                                            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Tháng</th>
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Doanh
                                                    thu
                                                </th>
                                                <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Tỷ
                                                    lệ
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {prepareChartDataPie().labels.map((label, index) => {
                                                const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                                const value = chartData.datasets[0].data[index];
                                                const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                                return (
                                                    <tr key={label}
                                                        className="hover:bg-blue-50 transition-colors duration-150">
                                                        <td className="p-3 border border-blue-100 text-center font-medium text-gray-700">{label}</td>
                                                        <td className="p-3 border border-blue-100 text-center text-gray-800">{formatCurrency(value)}</td>
                                                        <td className="p-3 border border-blue-100 text-center">
                                                            <div className="flex items-center justify-center pl-4">
                                                                <div
                                                                    className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                                        style={{width: `${percentage}%`}}
                                                                    ></div>
                                                                </div>
                                                                <span
                                                                    className="text-gray-700 w-12 text-left">{percentage}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold">
                                            <td className="p-3 border border-blue-100 text-center text-gray-800">Tổng
                                                    cộng
                                                </td>
                                                <td className="p-3 border border-blue-100 text-center text-green-700">
                                                    {formatCurrency(
                                                        (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                            .datasets[0].data.reduce((a, b) => a + b, 0)
                                                    )}
                                                </td>
                                                <td className="p-3 border border-blue-100 text-center text-gray-800">100%</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                            {chartGroupType === 'year' && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                        <span className="material-icons mr-2 text-blue-600 text-xl">date_range</span>
                                        Tổng doanh thu theo năm
                                    </h3>
                                    {selectedYears.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse rounded-lg overflow-hidden">
                                                <thead>
                                                <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                                                    <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Năm</th>
                                                    <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Doanh
                                                        thu
                                                    </th>
                                                    <th className="p-3 border border-blue-200 text-gray-700 font-semibold">Tỷ
                                                        lệ
                                                    </th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {prepareChartDataPie().labels.map((label, index) => {
                                                    const chartData = chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar();
                                                    const value = chartData.datasets[0].data[index];
                                                    const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
                                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                                                    return (
                                                        <tr key={label}
                                                            className="hover:bg-blue-50 transition-colors duration-150">
                                                            <td className="p-3 border border-blue-100 text-center font-medium text-gray-700">{label}</td>
                                                            <td className="p-3 border border-blue-100 text-center text-gray-800">{formatCurrency(value)}</td>
                                                            <td className="p-3 border border-blue-100 text-center">
                                                                <div className="flex items-center justify-center pl-4">
                                                                    <div
                                                                        className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                                                        <div
                                                                            className="bg-blue-600 h-2.5 rounded-full"
                                                                            style={{width: `${percentage}%`}}
                                                                        ></div>
                                                                    </div>
                                                                    <span
                                                                        className="text-gray-700 w-12 text-left">{percentage}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 font-semibold">
                                                <td className="p-3 border border-blue-100 text-center text-gray-800">Tổng
                                                        cộng
                                                    </td>
                                                    <td className="p-3 border border-blue-100 text-center text-green-700">
                                                        {formatCurrency(
                                                            (chartType === 'pie' ? prepareChartDataPie() : prepareChartDataBar())
                                                                .datasets[0].data.reduce((a, b) => a + b, 0)
                                                        )}
                                                    </td>
                                                    <td className="p-3 border border-blue-100 text-center text-gray-800">100%</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                                            <span
                                                className="material-icons text-gray-400 text-5xl mb-2">calendar_month</span>
                                            <p className="text-gray-600">Vui lòng chọn ít nhất một năm để hiển thị dữ
                                                liệu</p>
                                        </div>
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