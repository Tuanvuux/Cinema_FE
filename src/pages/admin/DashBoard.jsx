import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import NavbarAdmin from "@/components/layout/NavbarAdmin";

export default function DashBoard() {

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        document.title = 'Báo cáo doanh thu';
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
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">BÁO CÁO DOANH THU</h1>
                        <div className="flex items-center">
                            <div className="flex items-center">
                                <div className="ml-4 flex items-center">
                                    <span className="font-medium mr-2">ADMIN</span>
                                    <span className="material-icons">person</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}