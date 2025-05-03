import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavbarAdmin = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { to: '/admin/dashboard', icon: 'assessment', label: 'Báo cáo' },
        { to: '/admin/roommanagement', icon: 'meeting_room', label: 'Phòng chiếu' },
        { to: '/admin/showtimemanagement', icon: 'calendar_month', label: 'Lịch chiếu' },
        { to: '/admin/moviemanagement', icon: 'movie', label: 'Phim' },
        { to: '/admin/accountmanagement', icon: 'account_circle', label: 'Tài khoản' },
        { to: '/admin/seatmanagement', icon: 'event_seat', label: 'Ghế ngồi' },
        { to: '#', icon: 'confirmation_number', label: 'Quản lý vé đặt' },
    ];

    return (
        <div className="w-60 bg-gray-900 text-white p-4 flex flex-col h-screen">
            <h1 className="mb-4">
                <Link to="/">
                    <img
                        src="https://res.cloudinary.com/dbo5hvzdg/image/upload/v1746239645/f1ggme4jz1z10hyyclwc.png"
                        alt="Cinema Booking"
                        className="h-16 w-auto"
                    />
                </Link>
            </h1>

            <nav className="space-y-2 flex-grow">
                {navItems.map((item) => {
                    const isActive = currentPath === item.to;

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`flex items-center gap-2 py-2 px-3 rounded transition ${
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default NavbarAdmin;