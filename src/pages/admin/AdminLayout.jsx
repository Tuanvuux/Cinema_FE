import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import NavbarAdminMenu from '@/components/layout/NavbarAdminMenu.jsx';
import Dashboard from '@/pages/admin/Dashboard';
import RoomManagement from '@/pages/admin/RoomManagement';
import ShowtimeManagement from '@/pages/admin/ShowtimeManagement';
import MovieManagement from '@/pages/admin/MovieManagement';
import AccountManagement from '@/pages/admin/AccountManagement';
import SeatManagement from '@/pages/admin/SeatManagement';
import DashboardByTime from '@/pages/admin/DashboardByTime';
import DashboardByMovie from '@/pages/admin/DashboardByMovie';
import { useAuth } from "../../contexts/AuthContext";
import AccessDenied from "@/pages/admin/AccessDenied.jsx";
import LockSeatByShowTime from "@/pages/admin/LockSeatByShowTime.jsx"
import NewsManagement from "@/pages/admin/NewsManagement.jsx";

export default function AdminLayout() {
    const { user } = useAuth();
    const isEmployee = user?.role === "EMPLOYEE";

    const getDefaultPage = () => {
        return isEmployee ? 'moviemanagement' : 'dashboard';
    };

    const [currentPage, setCurrentPage] = useState(getDefaultPage);
    const [showSidebar, setShowSidebar] = useState(false);

    useEffect(() => {
        if (isEmployee && (
            currentPage === 'dashboard' ||
            currentPage.startsWith('dashboard-') ||
            currentPage === 'accountmanagement'
        )) {
            setCurrentPage(getDefaultPage());
        }
    }, [user?.role]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
        setShowSidebar(false); // đóng sidebar trên mobile sau khi click
    };

    const renderPage = () => {
        if (isEmployee && (
            currentPage === 'dashboard' ||
            currentPage.startsWith('dashboard-') ||
            currentPage === 'accountmanagement'
        )) {
            return <AccessDenied />;
        }

        switch (currentPage) {
            case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
            case 'dashboard-time': return <DashboardByTime />;
            case 'dashboard-movie': return <DashboardByMovie />;
            case 'roommanagement': return <RoomManagement />;
            case 'showtimemanagement': return <ShowtimeManagement />;
            case 'moviemanagement': return <MovieManagement />;
            case 'accountmanagement': return <AccountManagement />;
            case 'seatmanagement': return <SeatManagement />;
            case 'seat-lock': return <LockSeatByShowTime />;
            case 'newmanagement': return <NewsManagement />;
            default: return <Dashboard onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            {/* Sidebar – trượt trên mobile, luôn hiển thị trên md */}
            <div className={`fixed md:static top-0 left-0 z-40 h-full bg-white transition-transform duration-300
                            border-r w-60 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <NavbarAdminMenu currentPage={currentPage} onNavigate={handleNavigate} />
            </div>

            {/* Overlay – chỉ hiện khi mở menu trên mobile */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-opacity-50 z-30 md:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Nội dung chính */}
            <div className="flex-1 p-4 overflow-auto w-full">
                {/* Nút hamburger chỉ hiện trên mobile */}
                <button
                    className="md:hidden mb-4 text-gray-700 flex items-center gap-2"
                    onClick={() => setShowSidebar(!showSidebar)}
                >
                    {showSidebar ? <X size={24} /> : <Menu size={24} />}
                    <span className="font-semibold">Menu</span>
                </button>

                {renderPage()}
            </div>
        </div>
    );
}
