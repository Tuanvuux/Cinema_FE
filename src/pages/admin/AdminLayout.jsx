import React, { useState, useEffect } from 'react';
import NavbarAdmin from '@/components/layout/NavbarAdminMenu.jsx';
import Dashboard from '@/pages/admin/Dashboard';
import RoomManagement from '@/pages/admin/RoomManagement';
import ShowtimeManagement from '@/pages/admin/ShowtimeManagement';
import MovieManagement from '@/pages/admin/MovieManagement';
import AccountManagement from '@/pages/admin/AccountManagement';
import SeatManagement from '@/pages/admin/SeatManagement';
import DashboardByTime from '@/pages/admin/DashboardByTime';
import DashboardByMovie from '@/pages/admin/DashboardByMovie';
import CreateAccountForEmployee from "@/pages/admin/CreateAccountForEmployeeModal.jsx";
import { useAuth } from "../../contexts/AuthContext";
import AccessDenied from "@/pages/admin/AccessDenied.jsx"; // Cần tạo component này

export default function AdminLayout() {
    const { user } = useAuth();
    const isEmployee = user?.role === "EMPLOYEE";

    // Thiết lập trang mặc định dựa trên role
    const getDefaultPage = () => {
        if (isEmployee) {
            return 'moviemanagement'; // Trang mặc định cho nhân viên
        }
        return 'dashboard'; // Trang mặc định cho admin
    };

    const [currentPage, setCurrentPage] = useState(getDefaultPage);

    // Cập nhật trang khi role thay đổi
    useEffect(() => {
        // Nếu trang hiện tại là một trang mà employee không được phép truy cập,
        // thì chuyển đến trang mặc định
        if (isEmployee && (currentPage === 'dashboard' ||
            currentPage.startsWith('dashboard-') ||
            currentPage === 'accountmanagement')) {
            setCurrentPage(getDefaultPage());
        }
    }, [user?.role]);

    const handleNavigate = (page) => {
        setCurrentPage(page);
    };

    const renderPage = () => {
        // Kiểm tra quyền truy cập trước khi render trang
        if (isEmployee && (currentPage === 'dashboard' ||
            currentPage.startsWith('dashboard-') ||
            currentPage === 'accountmanagement')) {
            return <AccessDenied />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard onNavigate={handleNavigate} />;
            case 'dashboard-time':
                return <DashboardByTime />;
            case 'dashboard-movie':
                return <DashboardByMovie />;
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
                return <Dashboard onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex h-screen">
            <NavbarAdmin currentPage={currentPage} onNavigate={handleNavigate} />
            <div className="flex-1 p-4 overflow-auto">
                {renderPage()}
            </div>
        </div>
    );
}