import React, {useEffect,useState } from 'react';
import UserInfo from "@/pages/admin/UserInfo.jsx";
import {
    getSumMovies, getSumRooms,getSumSeats, getSumUser,getSumEmployee
} from "@/services/apiadmin.jsx";

const Dashboard = ({ onNavigate }) => {

    const [totalMovies, setTotalMovies] = useState(0);
    const [totalRooms, setTotalRooms] = useState(0);
    const [totalSeats, setTotalSeats] = useState(0);
    const [totalUserNotAdmin, setTotalUserNotAdmin] = useState(0);
    const [totalEmployee, setTotalEmployee] = useState(0);

    useEffect(() => {
        document.title = 'Báo cáo doanh thu';
        getSumMovies()
            .then((res) => {
                setTotalMovies(res || 0);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy tổng số phim:", err);
            });
        getSumRooms()
            .then((res) => {
                setTotalRooms(res || 0);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy tổng số phòng:", err);
            });
        getSumSeats()
            .then((res) => {
                setTotalSeats(res || 0);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy tổng số ghế:", err);
            });
        getSumUser()
            .then((res) => {
                setTotalUserNotAdmin(res || 0);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy tổng số người dùng:", err);
            });
        getSumEmployee()
            .then((res) => {
                setTotalEmployee(res || 0);
            })
            .catch((err) => {
                console.error("Lỗi khi lấy tổng số nhân viên:", err);
            });
    }, []);

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">TỔNG QUAN BÁO CÁO</h1>
                <UserInfo/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => onNavigate('dashboard-time')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-blue-800">Báo cáo theo thời gian</h2>
                            <span className="material-icons text-blue-600">schedule</span>
                        </div>
                        <p className="text-gray-600 mb-4">Xem báo cáo doanh thu và số lượng vé bán theo thời gian</p>
                        <div className="flex justify-end">
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('dashboard-time');
                                }}
                            >
                                Xem báo cáo
                            </button>
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => onNavigate('dashboard-movie')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-purple-800">Báo cáo theo phim</h2>
                            <span className="material-icons text-purple-600">movie</span>
                        </div>
                        <p className="text-gray-600 mb-4">Xem báo cáo doanh thu và số lượng vé bán theo từng phim</p>
                        <div className="flex justify-end">
                            <button
                                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigate('dashboard-movie');
                                }}
                            >
                                Xem báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Tổng quan hệ thống</h2>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
                            <div className="rounded-full bg-blue-100 p-3 mr-4">
                                <span className="material-icons text-blue-600">movie</span>
                            </div>
                            <div>
                                <p className="text-sm text-blue-800">Tổng số phim</p>
                                <p className="text-2xl font-bold text-blue-900">{totalMovies}</p>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                            <div className="rounded-full bg-green-100 p-3 mr-4">
                                <span className="material-icons text-green-600">meeting_room</span>
                            </div>
                            <div>
                                <p className="text-sm text-green-800">Phòng chiếu</p>
                                <p className="text-2xl font-bold text-green-900">{totalRooms}</p>
                            </div>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center">
                            <div className="rounded-full bg-purple-100 p-3 mr-4">
                                <span className="material-icons text-purple-600">event_seat</span>
                            </div>
                            <div>
                                <p className="text-sm text-purple-800">Tổng số ghế</p>
                                <p className="text-2xl font-bold text-purple-900">{totalSeats}</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center">
                            <div className="rounded-full bg-amber-100 p-3 mr-4">
                                <span className="material-icons text-amber-600">people</span>
                            </div>
                            <div>
                                <p className="text-sm text-amber-800">Khách hàng</p>
                                <p className="text-2xl font-bold text-amber-900">{totalUserNotAdmin}</p>
                            </div>
                        </div>

                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center">
                            <div className="rounded-full bg-rose-100 p-3 mr-4">
                                <span className="material-icons text-rose-600">badge</span>
                            </div>
                            <div>
                                <p className="text-sm text-rose-800">Nhân viên</p>
                                <p className="text-2xl font-bold text-rose-900">{totalEmployee}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            );
            };

export default Dashboard;