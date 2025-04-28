import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
export default function DashBoard() {
    useEffect(() => {
        document.title = 'Báo cáo';
    }, []);
    const [toast, setToast] = useState({
        account: false,
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
                account={toast.account}
            />

            <div className="flex h-full">
                <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4 ">
                        <Link to="/">Cinema Booking</Link>
                    </h1>

                    <nav className="space-y-4 flex-grow">
                        <Link to="/admin/dashboard"
                              className="flex items-center gap-2 py-2 px-3 bg-gray-800 rounded">
                            <span className="material-icons">assessment</span>
                            <span>Báo cáo</span>
                        </Link>
                        <Link to="/admin/roommanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">meeting_room</span>
                            <span>Phòng chiếu</span>
                        </Link>
                        <Link to="/admin/showtimemanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">calendar_month</span>
                            <span>Lịch chiếu</span>
                        </Link>
                        <Link to="/admin/moviemanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">movie</span>
                            <span>Phim</span>
                        </Link>
                        <Link to="/admin/accountmanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">account_circle</span>
                            <span>Tài khoản</span>
                        </Link>
                        <Link to="/admin/seatmanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">event_seat</span>
                            <span>Ghế ngồi</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">confirmation_number</span>
                            <span>Quản lý vé đặt</span>
                        </Link>

                    </nav>
                </div>
            </div>
        </div>
    )
}