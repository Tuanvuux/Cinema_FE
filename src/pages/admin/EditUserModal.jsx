"use client"

import { useEffect, useRef, useState } from "react"
import { getUserByUsername, updateUserAdmin } from "@/services/apiadmin.jsx"
import { AlertCircle, CheckCircle, X, User, Calendar, Mail, Phone, Eye, EyeOff, Save, Loader2 } from "lucide-react"

const EditUserModal = ({ isOpen, userInfo, onClose }) => {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
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
    })
    const modalRef = useRef()
    const [toast, setToast] = useState([])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (userInfo) {
            const username = userInfo.sub

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
            })

            getUserByUsername(username)
                .then((data) => {
                    setForm((prevForm) => ({
                        ...prevForm,
                        ...data,
                        birthday: data.birthday ? new Date(data.birthday).toISOString().split("T")[0] : "",
                        currentPassword: "",
                        password: "",
                        confirmPassword: "",
                    }))
                    setIsLoading(false)
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error)
                    setIsLoading(false)
                })
        }
    }, [userInfo])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prevForm) => ({ ...prevForm, [name]: value }))
    }

    const addToast = (message, type = "success") => {
        const id = Date.now()
        setToast((prev) => [...prev, { id, message, type, show: true }])

        setTimeout(() => {
            removeToast(id)
        }, 3000)
    }

    const removeToast = (id) => {
        setToast((prev) => prev.map((t) => (t.id === id ? { ...t, show: false } : t)))

        setTimeout(() => {
            setToast((prev) => prev.filter((t) => t.id !== id))
        }, 300)
    }

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
        )
    }

    const ToastNotification = ({ id, message, type, show, onClose }) => {
        if (!show) return null

        return (
            <div
                className={`transform transition-all duration-300 ${
                    show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
                } ${
                    type === "success"
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-red-500 to-red-600"
                } text-white px-6 py-4 rounded-xl shadow-2xl flex items-center min-w-[320px] border ${
                    type === "success" ? "border-green-400/20" : "border-red-400/20"
                }`}
            >
                <div className="bg-white/20 rounded-full p-1 mr-3">
                    {type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <span className="font-medium text-sm">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-auto text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        )
    }

    const handleSubmit = () => {
        if (form.password && form.password !== form.confirmPassword) {
            addToast("Mật khẩu mới không khớp!", "error")
            return
        }
        if (form.password && !form.currentPassword) {
            addToast("Vui lòng nhập mật khẩu hiện tại!", "error")
            return
        }

        setIsSaving(true)

        const updateData = {
            ...form,
            password: form.password || null,
        }

        if (form.password) {
            updateData.currentPassword = form.currentPassword
        }

        delete updateData.confirmPassword

        updateUserAdmin(form.userId, updateData)
            .then((response) => {
                addToast("Cập nhật thành công!")
                setTimeout(() => {
                    onClose()
                }, 1500)
            })
            .catch((err) => {
                if (err.response && err.response.data) {
                    addToast(err.response.data, "error")
                } else {
                    addToast("Lỗi khi cập nhật!", "error")
                }
                console.error(err)
            })
            .finally(() => {
                setIsSaving(false)
            })
    }

    if (isLoading)
        return (
            <div className="fixed inset-0 bg-gray-800/40 flex items-center justify-center z-50 transition-opacity duration-300">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-80 transform transition-all duration-300 scale-100">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="h-10 w-10 text-gray-600 animate-spin" />
                    </div>
                    <div className="text-center font-medium text-gray-700">Đang tải thông tin...</div>
                </div>
            </div>
        )

    return (
        <div
            className={`fixed inset-0 bg-gray-800/40 flex items-center justify-center z-50 transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <ToastContainer />

            <div
                ref={modalRef}
                className={`bg-white rounded-xl w-full max-w-md shadow-2xl relative max-h-[90vh] flex flex-col transform transition-all duration-300 ${
                    isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-600 to-gray-700 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Chỉnh sửa thông tin</h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors duration-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* User info header */}
                <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3 text-white shadow-md">
                        <User className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-800">{form.fullName || userInfo?.fullName || "N/A"}</div>
                        <div className="text-sm text-gray-500">{form.email || userInfo?.email || "N/A"}</div>
                    </div>
                </div>

                <div className="overflow-y-auto p-6 flex-grow">
                    <div className="space-y-5">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <User className="h-4 w-4 mr-2 text-gray-500" />
                                    Họ và tên
                                </label>
                                <input
                                    name="fullName"
                                    value={form.fullName || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Họ và tên"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                    Email
                                </label>
                                <input
                                    name="email"
                                    value={form.email || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Email"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                    Số điện thoại
                                </label>
                                <input
                                    name="phone"
                                    value={form.phone || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Số điện thoại"
                                />
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                    Ngày sinh
                                </label>
                                <input
                                    name="birthday"
                                    type="date"
                                    value={form.birthday || ""}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                    <User className="h-4 w-4 mr-2 text-gray-500" />
                                    Giới tính
                                </label>
                                <div className="flex space-x-6">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={form.gender === "Nam" || form.gender === "male"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
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
                                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-gray-700">Nữ</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Thay đổi mật khẩu
                            </h3>

                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                    <div className="relative">
                                        <input
                                            name="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={form.currentPassword || ""}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-10"
                                            placeholder="Mật khẩu hiện tại"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-10"
                                            placeholder="Mật khẩu mới"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
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
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 pr-10"
                                            placeholder="Xác nhận mật khẩu"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center ${
                            isSaving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditUserModal
