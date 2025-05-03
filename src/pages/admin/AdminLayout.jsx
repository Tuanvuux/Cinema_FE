import React, { useState } from 'react';
import NavbarAdmin from '@/components/layout/NavbarAdminMenu.jsx';
import Dashboard from '@/pages/admin/Dashboard';
import RoomManagement from '@/pages/admin/RoomManagement';
import ShowtimeManagement from '@/pages/admin/ShowtimeManagement';
import MovieManagement from '@/pages/admin/MovieManagement';
import AccountManagement from '@/pages/admin/AccountManagement';
import SeatManagement from '@/pages/admin/SeatManagement';

export default function AdminLayout() {
    const [currentPage, setCurrentPage] = useState('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'roommanagement':
                return <RoomManagement />;
            case 'showtimemanagement':
                return <ShowtimeManagement />;
            case 'moviemanagement':
                return <MovieManagement />;
            case 'accountmanagement':
                return <AccountManagement />;
            case 'seatmanagement':
                return <SeatManagement />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen">
            <NavbarAdmin currentPage={currentPage} onNavigate={setCurrentPage} />
            <div className="flex-1 p-4 overflow-auto">
                {renderPage()}
            </div>
        </div>
    );
}
