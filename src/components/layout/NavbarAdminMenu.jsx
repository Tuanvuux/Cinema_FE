import React from 'react';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { key: 'dashboard', icon: 'assessment', label: 'Báo cáo' },
    { key: 'roommanagement', icon: 'meeting_room', label: 'Phòng chiếu' },
    { key: 'showtimemanagement', icon: 'calendar_month', label: 'Lịch chiếu' },
    { key: 'moviemanagement', icon: 'movie', label: 'Phim' },
    { key: 'accountmanagement', icon: 'account_circle', label: 'Tài khoản' },
    { key: 'seatmanagement', icon: 'event_seat', label: 'Ghế ngồi' },
    // { key: '#', icon: 'confirmation_number', label: 'Quản lý vé đặt' },
];

const NavbarAdminMenu = ({ currentPage, onNavigate }) => {
    const navigate = useNavigate();
    return (
        <div className="w-60 bg-gray-900 text-white p-4 flex flex-col h-screen">
            <h1 className="mb-4 cursor-pointer" onClick={() => navigate('/')}>
                <img
                    src="https://res.cloudinary.com/dbo5hvzdg/image/upload/v1746239645/f1ggme4jz1z10hyyclwc.png"
                    alt="Cinema Booking"
                    className="h-16 w-auto"
                />
            </h1>

            <nav className="space-y-2 flex-grow">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onNavigate(item.key)}
                        className={`flex items-center w-full text-left gap-2 py-2 px-3 rounded transition ${
                            currentPage === item.key
                                ? 'bg-gray-800 text-white'
                                : 'hover:bg-gray-700 text-gray-300'
                        }`}
                    >
                        <span className="material-icons">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default NavbarAdminMenu;
