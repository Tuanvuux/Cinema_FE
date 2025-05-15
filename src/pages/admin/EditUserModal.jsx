import React, { useEffect, useState } from "react";
import { getUserByUsername, updateUserAdmin } from "@/services/apiadmin.jsx";

const EditUserModal = ({ userInfo, onClose }) => {
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

    useEffect(() => {
        // Use the userInfo from JWT for initial form data
        if (userInfo) {
            const username = userInfo.sub;

            // Pre-fill form with data from JWT if available
            setForm({
                username: username || "",
                fullName: userInfo.fullName || "",
                email: "", // Will be filled from API response
                currentPassword: "",
                password: "", // This will hold the new password
                confirmPassword: "",
                birthday: userInfo.birthday ? userInfo.birthday : "",
                phone: userInfo.phone || "",
                gender: userInfo.gender || "",
            });

            // Get complete user data from API
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

    const [toast, setToast] = useState({
        show: false,
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

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type }), 3000);
    };

    const handleSubmit = () => {
        if (form.password && form.password !== form.confirmPassword) {
            showToast("Mật khẩu mới không khớp!", "error");
            return;
        }
        if (form.password && !form.currentPassword) {
            showToast("Vui lòng nhập mật khẩu hiện tại!", "error");
            return;
        }

        // Prepare data for update - only send the new password in the password field
        const updateData = {
            ...form,
            // If we're changing the password, use the new password value
            // If not changing password, don't send password field at all
            password: form.password || null
        };

        // Include current password for verification if changing password
        if (form.password) {
            updateData.currentPassword = form.currentPassword;
        }

        // Remove fields that shouldn't be sent to the API
        delete updateData.confirmPassword;

        updateUserAdmin(form.userId, updateData)
            .then((response) => {
                showToast("Cập nhật thành công!");
                setTimeout(() => {
                    onClose();
                }, 1500);
            })
            .catch((err) => {
                // Check for specific error message about incorrect password
                if (err.response && err.response.data) {
                    showToast(err.response.data, "error");
                } else {
                    showToast("Lỗi khi cập nhật!", "error");
                }
                console.error(err);
            });
    };

    if (isLoading) return (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-center">Đang tải...</div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
            <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
            />

            <div className="bg-white rounded-lg w-full max-w-md shadow-md relative max-h-screen flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-center">Chỉnh sửa thông tin</h2>
                </div>

                {/* Phần hiển thị thông tin người dùng */}
                <div className="flex items-center px-6 py-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 text-lg">
                            {form.fullName ? form.fullName.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    <div>
                        <div className="font-medium">{form.fullName || userInfo?.fullName || "N/A "}</div>
                        <div className="text-sm text-gray-500">{form.email || userInfo?.email || "N/A"}</div>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">{/* Div có thể cuộn */}

                    <div>
                        <label className="block font-medium mb-1">Họ và tên</label>
                        <input
                            name="fullName"
                            value={form.fullName || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-3 rounded"
                            placeholder="Họ và tên"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input
                            name="email"
                            value={form.email || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-3 rounded bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">Số điện thoại</label>
                        <input
                            name="phone"
                            value={form.phone || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-3 rounded"
                            placeholder="Số điện thoại"
                        />
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Ngày sinh</label>
                        <input
                            name="birthday"
                            type="date"
                            value={form.birthday || ""}
                            onChange={handleChange}
                            className="border p-2 w-full mb-3 rounded"
                            placeholder="Ngày sinh"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="block font-medium mb-1">Giới tính</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={form.gender === "Nam" || form.gender === "male"}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Nam
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={form.gender === "Nữ" || form.gender === "female"}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                Nữ
                            </label>
                        </div>
                    </div>

                    <hr className="my-3" />
                    <div className="relative mb-3">
                        <label className="block font-medium mb-1">Nhập mật khẩu hiện tại</label>
                        <div className="relative">
                            <input
                                name="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={form.currentPassword || ""}
                                onChange={handleChange}
                                className="border p-2 w-full rounded pr-10"
                                placeholder="Mật khẩu hiện tại"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
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
                            </button>
                        </div>
                    </div>

                    <div className="relative mb-3">
                        <label className="block font-medium mb-1">Nhập mật khẩu mới</label>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password || ""}
                                onChange={handleChange}
                                className="border p-2 w-full rounded pr-10"
                                placeholder="Mật khẩu mới"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
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
                            </button>
                        </div>
                    </div>

                    <div className="relative mb-3">
                        <label className="block font-medium mb-1">Nhập lại mật khẩu mới</label>
                        <div className="relative">
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={form.confirmPassword || ""}
                                onChange={handleChange}
                                className="border p-2 w-full rounded pr-10"
                                placeholder="Xác nhận mật khẩu"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
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
                            </button>
                        </div>
                    </div>

                </div>
                {/* Đóng div có thể cuộn */}

                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded">
                        Hủy
                    </button>
                    <button onClick={handleSubmit}
                            className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800">
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;