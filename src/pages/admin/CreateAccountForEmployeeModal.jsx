import React, { useState, useEffect,useRef  } from "react";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { addEmployee,checkEmployeeIsValid } from "@/services/apiadmin.jsx";
import Button from "@/components/ui/button.jsx";
import {CheckCircle, AlertCircle, X } from "lucide-react";


export default function CreateAccountForEmployeeModal({ isOpen, onClose, onEmployeeCreated  }) {
    const modalRef = useRef();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [toast, setToast] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
                handleCancel(); // Đóng modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const addToast = (message, type = 'success') => {
        const id = Date.now(); // Tạo ID duy nhất cho mỗi toast
        setToast(prev => [...prev, { id, message, type, show: true }]);

        // Tự động xóa toast sau 3 giây
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Hàm xóa toast
    const removeToast = (id) => {
        setToast(prev => prev.map(t =>
            t.id === id ? { ...t, show: false } : t
        ));

        // Xóa toast khỏi mảng sau khi animation kết thúc
        setTimeout(() => {
            setToast(prev => prev.filter(t => t.id !== id));
        }, 300);
    };

    // Component Toast Container để hiển thị nhiều toast
    const ToastContainer = () => {
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toast.map((t) => (
                    <ToastNotification
                        key={t.id}
                        id={t.id}
                        message={t.message}
                        type={t.type}
                        show={t.show}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        );
    };

    // Component Toast Notification cập nhật
    const ToastNotification = ({ id, message, type, show, onClose }) => {
        if (!show) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`px-6 py-3 rounded-md shadow-lg flex items-center justify-between ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
            >
                <div className="flex items-center">
                    {type === 'success' ?
                        <CheckCircle className="mr-2 h-5 w-5 text-white" /> :
                        <AlertCircle className="mr-2 h-5 w-5 text-white" />
                    }
                    <p className="text-white font-medium">{message}</p>
                </div>
                <button
                    className="text-white opacity-70 hover:opacity-100"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    };

    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Xóa lỗi khi user bắt đầu nhập
        if (errors[name] && value.trim()) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = async () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        } else {
            try {
                const res = await checkEmployeeIsValid(formData.username);
                if (res === true) {
                    newErrors.username = 'Tên nhân viên đã tồn tại!';
                }
            } catch (error) {
                console.error('Lỗi khi kiểm tra username:', error);
                newErrors.username = 'Không kiểm tra được tên đăng nhập!';
            }
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        }
        else if (formData.confirmPassword !== formData.password ) {
            newErrors.confirmPassword = 'Mật khẩu mới không khớp';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isValid = await validateForm();
        if (!isValid) return;

        // // Kiểm tra xác nhận mật khẩu
        // if (formData.password !== formData.confirmPassword) {
        //     addToast("Mật khẩu mới không khớp!", "error");
        //     setErrors(prev => ({
        //         ...prev,
        //         confirmPassword: 'Mật khẩu không khớp'
        //     }));
        //     return;
        // }

        setIsLoading(true);

        try {
            await addEmployee({
                fullName: formData.fullName,
                username: formData.username,
                password: formData.password
            });
            addToast('Tạo tài khoản nhân viên thành công!','success')
            // Reset form
            setFormData({ fullName:'',username: '', password: '', confirmPassword: '' });
            setErrors({});
            if (onEmployeeCreated) {
                await onEmployeeCreated();
            }

            // // Đóng modal
            setTimeout(() => {
                onClose();
            }, 10);
        } catch (error) {
            // addToast(error.response?.data || 'Lỗi khi tạo tài khoản!','error')
        }
        setIsLoading(false);
    };
    const handleCancel = () => {
        setErrors({});  // reset lỗi
        onClose();      // gọi hàm đóng modal
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Toast notification được đưa ra khỏi modal container */}
            <ToastContainer/>

            <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                    <div className="p-4 relative">
                        {/* Nút đóng modal */}
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                            aria-label="Đóng"
                            type="button"
                        >
                            &times;
                        </button>

                        <h2 className="text-xl font-bold text-left">Thêm nhân viên</h2>
                    </div>

                    {/* FORM ĐĂNG KÝ NHÂN VIÊN */}
                    <div className="flex items-center justify-center">
                        <form onSubmit={handleSubmit}
                              className="bg-white p-8 rounded w-full max-w-md space-y-4">
                            <div>
                                <label className="block font-medium">Họ tên <span
                                    className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
                                        errors.fullName
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium">Tên đăng nhập <span
                                    className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
                                        errors.username
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                    }`}
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>

                            <div className="relative">
                                <label className="block font-medium">Mật khẩu <span
                                    className="text-red-500">*</span></label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
                                        errors.password
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                    }`}
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
                                {errors.password && (
                                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            <div className="relative">
                                <label className="block font-medium">Xác nhận mật khẩu <span
                                    className="text-red-500">*</span></label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm transition-all duration-200 ${
                                        errors.confirmPassword
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                    }`}
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
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-4 pt-4 mt-8">
                                <button
                                    type="button" // Changed to type="button" to prevent form submission
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg ${
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
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}