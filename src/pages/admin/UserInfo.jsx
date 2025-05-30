"use client"

import { useState, useRef, useEffect } from "react"
import EditUserModal from "@/pages/admin/EditUserModal.jsx"
import { User, ChevronDown, Settings, LogOut, UserCircle } from "lucide-react"

// Hàm parse token
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join(""),
        )
        return JSON.parse(jsonPayload)
    } catch (e) {
        return null
    }
}

const UserInfo = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    const token = localStorage.getItem("token")
    const userInfo = token ? parseJwt(token) : null

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleEditProfile = () => {
        setIsOpen(true)
        setIsDropdownOpen(false)
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
    }

    const username = userInfo?.username || userInfo?.sub || "Guest"
    const isGuest = username === "Guest"

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                {/* User Info Button */}
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200 group"
                >
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        {!isGuest && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>

                    {/* Username */}
                    <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700 text-sm">{username}</span>
                        <ChevronDown
                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                            }`}
                        />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                                    <UserCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{username}</p>
                                    <p className="text-xs text-gray-500">{isGuest ? "Khách" : userInfo?.email || "Người dùng"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {!isGuest && (
                                <button
                                    onClick={handleEditProfile}
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <Settings className="w-4 h-4 text-gray-500" />
                                    <span>Chỉnh sửa thông tin</span>
                                </button>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            {isOpen && <EditUserModal isOpen={isOpen} userInfo={userInfo} onClose={() => setIsOpen(false)} />}
        </>
    )
}

export default UserInfo
