import React from 'react';
import UserInfo from "@/pages/admin/UserInfo.jsx";

const DashboardByMovie = () => {
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
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Đến ngày
                        </label>
                        <input
                            type="date"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="flex items-end">
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Xem báo cáo
                        </button>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Top phim doanh thu cao nhất</h2>
                    <div className="h-80 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">Biểu đồ doanh thu theo phim sẽ hiển thị ở đây</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4">Top phim có lượt xem cao nhất</h2>
                    <div className="h-80 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">Biểu đồ lượt xem theo phim sẽ hiển thị ở đây</p>
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
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">Avengers: Endgame</td>
                                <td className="py-3 px-6 text-right">12,840,000</td>
                                <td className="py-3 px-6 text-right">428</td>
                                <td className="py-3 px-6 text-right">24</td>
                                <td className="py-3 px-6 text-right">89%</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">Joker</td>
                                <td className="py-3 px-6 text-right">8,510,000</td>
                                <td className="py-3 px-6 text-right">284</td>
                                <td className="py-3 px-6 text-right">18</td>
                                <td className="py-3 px-6 text-right">79%</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">Lật Mặt 7</td>
                                <td className="py-3 px-6 text-right">6,720,000</td>
                                <td className="py-3 px-6 text-right">224</td>
                                <td className="py-3 px-6 text-right">16</td>
                                <td className="py-3 px-6 text-right">70%</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">Mai</td>
                                <td className="py-3 px-6 text-right">4,380,000</td>
                                <td className="py-3 px-6 text-right">146</td>
                                <td className="py-3 px-6 text-right">12</td>
                                <td className="py-3 px-6 text-right">61%</td>
                            </tr>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-3 px-6 text-left">Parasite</td>
                                <td className="py-3 px-6 text-right">3,200,000</td>
                                <td className="py-3 px-6 text-right">163</td>
                                <td className="py-3 px-6 text-right">15</td>
                                <td className="py-3 px-6 text-right">54%</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardByMovie;