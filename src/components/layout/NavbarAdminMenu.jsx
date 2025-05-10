import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const navItems = [
    {
        key: 'dashboard',
        icon: 'assessment',
        label: 'Báo cáo',
        hasSubmenu: true,
        submenu: [
            { key: 'dashboard-time',icon: 'watch_later' ,label: 'Theo thời gian' },
            { key: 'dashboard-movie',icon: 'play_circle', label: 'Theo phim' }
        ]
    },
    { key: 'roommanagement', icon: 'meeting_room', label: 'Phòng chiếu' },
    { key: 'showtimemanagement', icon: 'calendar_month', label: 'Lịch chiếu' },
    { key: 'moviemanagement', icon: 'movie', label: 'Phim' },
    { key: 'accountmanagement', icon: 'account_circle', label: 'Tài khoản' },
    { key: 'seatmanagement', icon: 'event_seat', label: 'Ghế ngồi' },
    // { key: '#', icon: 'confirmation_number', label: 'Quản lý vé đặt' },
];

const NavbarAdminMenu = ({ currentPage, onNavigate }) => {
    const navigate = useNavigate();
    const [expandedItem, setExpandedItem] = useState(null);

    const handleItemClick = (item) => {
        if (item.hasSubmenu) {
            setExpandedItem(expandedItem === item.key ? null : item.key);
            if (item.key === 'dashboard') {
                onNavigate('dashboard');
            }
        } else {
            onNavigate(item.key);
            setExpandedItem(null);
        }
    };

    const handleSubmenuClick = (parentKey, submenuKey) => {
        onNavigate(submenuKey);
    };

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
                    <div key={item.key} className="space-y-1">
                        <button
                            onClick={() => handleItemClick(item)}
                            className={`flex items-center justify-between w-full text-left gap-2 py-2 px-3 rounded transition ${
                                currentPage === item.key || currentPage.startsWith(`${item.key}-`)
                                    ? 'bg-gray-800 text-white'
                                    : 'hover:bg-gray-700 text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-icons">{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                            {item.hasSubmenu && (
                                <span className="material-icons text-sm">
                                    {expandedItem === item.key ? 'expand_less' : 'expand_more'}
                                </span>
                            )}
                        </button>

                        {item.hasSubmenu && expandedItem === item.key && (
                            <div className="pl-8 space-y-1 bg-gray-800 rounded">
                                {item.submenu.map((subItem) => (
                                    <button
                                        key={subItem.key}
                                        onClick={() => handleSubmenuClick(item.key, subItem.key)}
                                        className={`flex items-center w-full text-left py-2 px-3 rounded transition ${
                                            currentPage === subItem.key
                                                ? 'bg-gray-700 text-white'
                                                : 'hover:bg-gray-700 text-gray-300'
                                        }`}
                                    >
                                        <span className="material-icons mr-2 text-sm">{subItem.icon}</span>
                                        <span>{subItem.label}</span>
                                    </button>
                                ))}

                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default NavbarAdminMenu;