import React, { useState, useEffect,useRef  } from "react";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { addEmployee } from "@/services/apiadmin.jsx";
import Button from "@/components/ui/button.jsx";

export default function CreateAccountForEmployeeModal({ isOpen, onClose }) {
    const modalRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
                onClose(); // Đóng modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const ToastNotification = ({ message, type, show }) => {
        if (!show) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`fixed top-4 right-4 z-[9999] px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0
                }}
            >
                {message}
            </div>
        );
    };

    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra xác nhận mật khẩu
        if (formData.password !== formData.confirmPassword) {
            showToast("Mật khẩu mới không khớp!", "error");
            return;
        }
        setIsLoading(true);

        try {
            await addEmployee({
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password
            });

            setToast({
                show: true,
                message: 'Tạo tài khoản nhân viên thành công!',
                type: 'success'
            });

            // Reset form
            setFormData({ fullName:'',username: '', password: '', confirmPassword: '' });
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data || 'Lỗi khi tạo tài khoản!',
                type: 'error'
            });
        }

        setTimeout(() => {
            setToast({ ...toast, show: false });
        }, 3000);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Toast notification được đưa ra khỏi modal container */}
            <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
            />

            <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                    <div className="p-4 border-b relative">
                        {/* Nút đóng modal */}
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                            aria-label="Đóng"
                            type="button"
                        >
                            &times;
                        </button>

                        <h2 className="text-xl font-bold text-center">Thêm nhân viên</h2>
                    </div>

                    {/* FORM ĐĂNG KÝ NHÂN VIÊN */}
                    <div className="flex items-center justify-center">
                        <form onSubmit={handleSubmit}
                              className="bg-white p-8 rounded w-full max-w-md space-y-4">
                            <div>
                                <label className="block font-medium">Họ tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <label className="block font-medium">Mật khẩu</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                    required
                                />
                                <span
                                    className="absolute right-3 top-9 cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        // Icon con mắt mở
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    ) : (
                                        // Icon con mắt bị gạch
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.142-3.292m3.422-2.43A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-1.04 2.212M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 3l18 18"/>
                                        </svg>
                                    )}
                                </span>
                            </div>

                            <div className="relative">
                                <label className="block font-medium">Xác nhận mật khẩu</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                    required
                                />
                                <span
                                    className="absolute right-3 top-9 cursor-pointer text-gray-500"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        // Icon con mắt mở
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                        </svg>
                                    ) : (
                                        // Icon con mắt bị gạch
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.142-3.292m3.422-2.43A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-1.04 2.212M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M3 3l18 18"/>
                                        </svg>
                                    )}
                                </span>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 ${
                                    isLoading ? " cursor-not-allowed" : " "
                                }`}
                            >
                                {isLoading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                ) : (
                                    "Tạo tài khoản"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}