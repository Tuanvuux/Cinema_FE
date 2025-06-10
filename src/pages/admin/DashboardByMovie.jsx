import React, { useState, useEffect } from 'react';
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { getMovieRevenueReport, getMovieViewsReport, getMovieDetailReport } from '@/services/apiadmin.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import format from 'date-fns/format';
import vi from 'date-fns/locale/vi';
import {RefreshCw} from "lucide-react";

const DashboardByMovie = () => {
    const [startDate, setStartDate] = useState(format(new Date(new Date().setFullYear(new Date().getFullYear() - 2)), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [revenueData, setRevenueData] = useState([]);
    const [viewsData, setViewsData] = useState([]);
    const [detailData, setDetailData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('revenue');
    const [animateCharts, setAnimateCharts] = useState(false);

    const fetchReports = async (start = startDate, end = endDate) => {
        try {
            setLoading(true);
            setAnimateCharts(false);

            // Fetch all reports in parallel
            const [revenueResponse, viewsResponse, detailResponse] = await Promise.all([
                getMovieRevenueReport(start, end),
                getMovieViewsReport(start, end),
                getMovieDetailReport(start, end)
            ]);

            // Process revenue data for chart (limit to top 10)
            const processedRevenueData = revenueResponse
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 10)
                .map(item => ({
                    name: item.movieName.length > 20 ? item.movieName.substring(0, 20) + '...' : item.movieName,
                    revenue: item.revenue,
                    fullName: item.movieName // Keep full name for tooltip
                }));

            // Process views data for chart (limit to top 10)
            const processedViewsData = viewsResponse
                .sort((a, b) => b.ticketCount - a.ticketCount)
                .slice(0, 10)
                .map(item => ({
                    name: item.movieName.length > 20 ? item.movieName.substring(0, 20) + '...' : item.movieName,
                    views: item.ticketCount,
                    fullName: item.movieName // Keep full name for tooltip
                }));

            setRevenueData(processedRevenueData);
            setViewsData(processedViewsData);
            setDetailData(detailResponse);

            // Trigger animation after data is loaded
            setTimeout(() => setAnimateCharts(true), 100);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount and when date range changes
    useEffect(() => {
        fetchReports(startDate,endDate);
        document.title = 'Báo cáo doanh thu theo phim';
    }, []); // Empty dependency array to run only on mount

    const handleGenerateReport = () => {
        fetchReports(startDate,endDate);
    };

    const handleRefresh = () => {
        // Reset về ngày mặc định (30 ngày trước đến hôm nay)
        const defaultStartDate = format(new Date(new Date().setFullYear(new Date().getFullYear() - 2)), 'yyyy-MM-dd');
        const defaultEndDate = format(new Date(), 'yyyy-MM-dd');

        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);

        // Fetch reports với ngày mặc định
        fetchReports(defaultStartDate, defaultEndDate);
    }

    // Format currency for display
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 shadow-lg rounded-md transition-all duration-300">
                    <p className="font-bold mb-1 text-gray-800">{payload[0].payload.fullName || label}</p>
                    {payload[0].name === "revenue" &&
                        <p className="text-blue-800">{`Doanh thu: ${formatCurrency(payload[0].value)} VND`}</p>}
                    {payload[0].name === "views" &&
                        <p className="text-blue-600">{`Số vé bán: ${formatCurrency(payload[0].value)}`}</p>}
                </div>
            );
        }
        return null;
    };

    // Calculate total values for summary
    const totalRevenue = detailData.reduce((sum, movie) => sum + movie.revenue, 0);
    const totalTickets = detailData.reduce((sum, movie) => sum + movie.ticketCount, 0);
    const totalShowtimes = detailData.reduce((sum, movie) => sum + movie.showtimeCount, 0);
    const avgOccupancyRate = detailData.length > 0
        ? (detailData.reduce((sum, movie) => sum + movie.occupancyRate, 0) / detailData.length).toFixed(2)
        : 0;

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    BÁO CÁO DOANH THU THEO PHIM
                </h1>
                <UserInfo className="w-full md:w-auto"/>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Từ ngày */}
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="shadow appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    {/* Đến ngày */}
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="shadow appearance-none border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    {/* Nút xem báo cáo */}
                    <div className="flex items-end md:items-center w-full md:w-auto gap-x-2 pt-[26px]">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className={`w-full md:w-auto ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-800'} text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-300 transform hover:scale-105`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tải...
                                </div>
                            ) : 'Xem báo cáo'}
                        </button>

                        <button
                            onClick={handleRefresh}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 shadow flex items-center justify-center"
                            title="Tải lại"
                        >
                            <RefreshCw className="h-4 w-4 text-gray-700" />
                        </button>
                    </div>
                </div>

                {/* Dashboard Summary Cards */}
                {!loading && detailData.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div
                            className={`bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow-md p-4 text-white transition-all duration-500 transform hover:scale-105 ${animateCharts ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="text-lg font-semibold mb-2">Tổng doanh thu</h3>
                            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)} VND</p>
                        </div>
                        <div
                            className={`bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg shadow-md p-4 text-white transition-all duration-500 delay-100 transform hover:scale-105 ${animateCharts ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="text-lg font-semibold mb-2">Tổng số vé bán</h3>
                            <p className="text-2xl font-bold">{formatCurrency(totalTickets)}</p>
                        </div>
                        <div
                            className={`bg-gradient-to-r from-blue-300 to-blue-500 rounded-lg shadow-md p-4 text-white transition-all duration-500 delay-200 transform hover:scale-105 ${animateCharts ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="text-lg font-semibold mb-2">Tổng lịch chiếu</h3>
                            <p className="text-2xl font-bold">{formatCurrency(totalShowtimes)}</p>
                        </div>
                        <div className={`bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg shadow-md p-4 text-white transition-all duration-500 delay-300 transform hover:scale-105 ${animateCharts ? 'opacity-100' : 'opacity-0'}`}>
                            <h3 className="text-lg font-semibold mb-2">Tỷ lệ lấp đầy TB</h3>
                            <p className="text-2xl font-bold">{avgOccupancyRate}%</p>
                        </div>
                    </div>
                )}

                {/* Chart Section with Tabs */}
                <div className="mb-8">
                    <div className="flex mb-4 border-b">
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'revenue' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                            onClick={() => setActiveTab('revenue')}
                        >
                            Top phim doanh thu cao nhất
                        </button>
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'views' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-500'}`}
                            onClick={() => setActiveTab('views')}
                        >
                            Top phim có lượt xem cao nhất
                        </button>
                    </div>

                    <div className={`h-96 bg-gray-50 rounded-lg border border-gray-200 shadow-inner transition-opacity duration-500 ${animateCharts ? 'opacity-100' : 'opacity-0'}`}>
                        {activeTab === 'revenue' && revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={revenueData}
                                    margin={{top: 20, right: 30, left: 20, bottom: 60}}
                                    barSize={40}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        tick={{fontSize: 12}}
                                        stroke="#6b7280"
                                    />
                                    <YAxis
                                        tickFormatter={(value) => value >= 1000000
                                            ? `${(value / 1000000).toFixed(1)}M`
                                            : value >= 1000
                                                ? `${(value / 1000).toFixed(1)}K`
                                                : value}
                                        stroke="#6b7280"
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{paddingTop: 10}} />
                                    <Bar
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        fill="#1E40AF"
                                        radius={[4, 4, 0, 0]}
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : activeTab === 'views' && viewsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={viewsData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    barSize={40}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        tick={{ fontSize: 12 }}
                                        stroke="#6b7280"
                                    />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{paddingTop: 10}} />
                                    <Bar
                                        dataKey="views"
                                        name="Số vé bán"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang tải dữ liệu...
                                        </div>
                                    ) : 'Không có dữ liệu trong khoảng thời gian đã chọn'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Chi tiết theo phim</h2>
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full">
                            <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-800 text-white uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left rounded-tl-lg">Tên phim</th>
                                <th className="py-3 px-6 text-right">Doanh thu (VND)</th>
                                <th className="py-3 px-6 text-right">Số vé bán</th>
                                <th className="py-3 px-6 text-right">Số lịch chiếu</th>
                                <th className="py-3 px-6 text-right rounded-tr-lg">Tỷ lệ lấp đầy TB</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang tải dữ liệu...
                                        </div>
                                    </td>
                                </tr>
                            ) : detailData.length > 0 ? (
                                detailData.map((movie, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors duration-300 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                    >
                                        <td className="py-3 px-6 text-left whitespace-nowrap font-medium">{movie.movieName}</td>
                                        <td className="py-3 px-6 text-right text-blue-800 font-medium">{formatCurrency(movie.revenue)}</td>
                                        <td className="py-3 px-6 text-right">{formatCurrency(movie.ticketCount)}</td>
                                        <td className="py-3 px-6 text-right">{movie.showtimeCount}</td>
                                        <td className="py-3 px-6 text-right">
                                            <div className="flex items-center justify-end">
                                                <div className="mr-2">{movie.occupancyRate}%</div>
                                                <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full"
                                                        style={{ width: `${movie.occupancyRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">Không có dữ liệu trong khoảng thời gian đã chọn</td>
                                </tr>
                            )}

                            {detailData.length > 0 && (
                                <tr className="bg-blue-50 font-bold text-blue-800 border-t-2 border-blue-300">
                                    <td className="py-3 px-6 text-left">Tổng cộng</td>
                                    <td className="py-3 px-6 text-right">{formatCurrency(totalRevenue)}</td>
                                    <td className="py-3 px-6 text-right">{formatCurrency(totalTickets)}</td>
                                    <td className="py-3 px-6 text-right">{formatCurrency(totalShowtimes)}</td>
                                    <td className="py-3 px-6 text-right">{avgOccupancyRate}%</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardByMovie;