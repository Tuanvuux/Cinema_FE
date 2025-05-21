import React, {useEffect, useRef, useState} from "react";
import { getUserByUsername, updateUserAdmin } from "@/services/apiadmin.jsx";
import {AlertCircle, CheckCircle, X} from "lucide-react";

const EditUserModal = ({ isOpen, userInfo, onClose }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [form, setForm] = useState({
        username: "",
        email: "",
        currentPassword: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        birthday: "",
        phone: "",
        gender: "",
    });
    const modalRef = useRef();

    const [toast, setToast] = useState([]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (userInfo) {
            const username = userInfo.sub;

            setForm({
                username: username || "",
                fullName: userInfo.fullName || "",
                email: "",
                currentPassword: "",
                password: "",
                confirmPassword: "",
                birthday: userInfo.birthday ? userInfo.birthday : "",
                phone: userInfo.phone || "",
                gender: userInfo.gender || "",
            });

            getUserByUsername(username)
                .then((data) => {
                    setForm(prevForm => ({
                        ...prevForm,
                        ...data,
                        birthday: data.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "",
                        currentPassword: "",
                        password: "",
                        confirmPassword: ""
                    }));
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    setIsLoading(false);
                });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({ ...prevForm, [name]: value }));
    };

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

    const handleSubmit = () => {
        if (form.password && form.password !== form.confirmPassword) {
            addToast("Mật khẩu mới không khớp!", "error");
            return;
        }
        if (form.password && !form.currentPassword) {
            addToast("Vui lòng nhập mật khẩu hiện tại!", "error");
            return;
        }

        const updateData = {
            ...form,
            password: form.password || null
        };

        if (form.password) {
            updateData.currentPassword = form.currentPassword;
        }

        delete updateData.confirmPassword;

        updateUserAdmin(form.userId, updateData)
            .then((response) => {
                addToast("Cập nhật thành công!");
                setTimeout(() => {
                    onClose();
                }, 1500);
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    addToast(err.response.data, "error");
                } else {
                    addToast("Lỗi khi cập nhật!", "error");
                }
                console.error(err);
            });
    };

    if (isLoading) return (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
                <div className="text-center font-medium">Đang tải thông tin...</div>
            </div>
        </div>
    );

    return (
        <div className={`fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/*<ToastNotification*/}
            {/*    message={toast.message}*/}
            {/*    type={toast.type}*/}
            {/*    show={toast.show}*/}
            {/*/>*/}
            <ToastContainer/>

            <div
                ref={modalRef}
                className={`bg-white rounded-lg w-full max-w-md shadow-xl relative max-h-[90vh] flex flex-col transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
            >
                <div className="p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 text-center">Chỉnh sửa thông tin</h2>
                </div>

                {/* User info header */}
                <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-700 font-medium text-xl">
                        {form.fullName ? form.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{form.fullName || userInfo?.fullName || "N/A"}</div>
                        <div className="text-sm text-gray-500">{form.email || userInfo?.email || "N/A"}</div>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                            <input
                                name="fullName"
                                value={form.fullName || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                                placeholder="Họ và tên"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                value={form.email || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                            <input
                                name="phone"
                                value={form.phone || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                                placeholder="Số điện thoại"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                            <input
                                name="birthday"
                                type="date"
                                value={form.birthday || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                                placeholder="Ngày sinh"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                            <div className="flex space-x-6">
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={form.gender === "Nam" || form.gender === "male"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-gray-700 focus:ring-gray-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Nam</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={form.gender === "Nữ" || form.gender === "female"}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-gray-700 focus:ring-gray-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Nữ</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Thay đổi mật khẩu</h3>

                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <input
                                            name="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={form.currentPassword || ""}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition pr-10"
                                            placeholder="Mật khẩu hiện tại"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.142-3.292m3.422-2.43A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-1.04 2.212M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <div className="relative">
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={form.password || ""}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition pr-10"
                                            placeholder="Mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.142-3.292m3.422-2.43A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-1.04 2.212M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                                    <div className="relative">
                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={form.confirmPassword || ""}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition pr-10"
                                            placeholder="Xác nhận mật khẩu"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 012.142-3.292m3.422-2.43A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.957 9.957 0 01-1.04 2.212M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;