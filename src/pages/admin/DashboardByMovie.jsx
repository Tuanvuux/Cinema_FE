import React, { useState, useEffect } from 'react';
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { getMovieRevenueReport, getMovieViewsReport, getMovieDetailReport } from '@/services/apiadmin.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import format from 'date-fns/format';
import vi from 'date-fns/locale/vi';

const DashboardByMovie = () => {
    const [startDate, setStartDate] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [revenueData, setRevenueData] = useState([]);
    const [viewsData, setViewsData] = useState([]);
    const [detailData, setDetailData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);

            // Fetch all reports in parallel
            const [revenueResponse, viewsResponse, detailResponse] = await Promise.all([
                getMovieRevenueReport(startDate, endDate),
                getMovieViewsReport(startDate, endDate),
                getMovieDetailReport(startDate, endDate)
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
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load data on component mount and when date range changes
    useEffect(() => {
        fetchReports();
    }, []); // Empty dependency array to run only on mount

    const handleGenerateReport = () => {
        fetchReports();
    };

    // Format currency for display
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 shadow-md rounded">
                    <p className="font-bold">{payload[0].payload.fullName || label}</p>
                    {payload[0].name === "revenue" &&
                        <p>{`Doanh thu: ${formatCurrency(payload[0].value)} VND`}</p>}
                    {payload[0].name === "views" &&
                        <p>{`Số vé bán: ${formatCurrency(payload[0].value)}`}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold mb-6">BÁO CÁO DOANH THU THEO PHIM</h1>
                <UserInfo/>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Từ ngày
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className={`${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
                        >
                            {loading ? 'Đang tải...' : 'Xem báo cáo'}
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Top phim doanh thu cao nhất</h2>
                    <div className="h-80 bg-gray-50 rounded-lg border border-gray-200">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={revenueData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => value >= 1000000
                                            ? `${(value / 1000000).toFixed(1)}M`
                                            : value >= 1000
                                                ? `${(value / 1000).toFixed(1)}K`
                                                : value}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="revenue" name="Doanh thu" fill="#1E40AF" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">
                                    {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu trong khoảng thời gian đã chọn'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Top phim có lượt xem cao nhất</h2>
                    <div className="h-80 bg-gray-50 rounded-lg border border-gray-200">
                        {viewsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={viewsData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={70}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="views" name="Số vé bán" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">
                                    {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu trong khoảng thời gian đã chọn'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold mb-4">Chi tiết theo phim</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                <th className="py-3 px-6 text-left">Tên phim</th>
                                <th className="py-3 px-6 text-right">Doanh thu (VND)</th>
                                <th className="py-3 px-6 text-right">Số vé bán</th>
                                <th className="py-3 px-6 text-right">Số suất chiếu</th>
                                <th className="py-3 px-6 text-right">Tỷ lệ lấp đầy</th>
                            </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center">Đang tải dữ liệu...</td>
                                </tr>
                            ) : detailData.length > 0 ? (
                                detailData.map((movie, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left">{movie.movieName}</td>
                                        <td className="py-3 px-6 text-right">{formatCurrency(movie.revenue)}</td>
                                        <td className="py-3 px-6 text-right">{movie.ticketCount}</td>
                                        <td className="py-3 px-6 text-right">{movie.showtimeCount}</td>
                                        <td className="py-3 px-6 text-right">{movie.occupancyRate}%</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center">Không có dữ liệu trong khoảng thời gian đã chọn</td>
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