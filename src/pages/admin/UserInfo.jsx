import React, { useState } from "react";
import EditUserModal from "@/pages/admin/EditUserModal.jsx";

// Hàm parse token
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

const UserInfo = () => {
    const [isOpen, setIsOpen] = useState(false);
    const token = localStorage.getItem("token");
    const userInfo = token ? parseJwt(token) : null;

    const handleClick = () => {
        setIsOpen(true);
    };

    return (
        <>
            <div className="flex items-center cursor-pointer" onClick={handleClick}>
                <div className="ml-4 flex items-center">
                    <span className="font-medium mr-2">{userInfo?.username || userInfo?.sub || "Guest"}</span>
                    <span className="material-icons">person</span>
                </div>
            </div>

            {isOpen && (
                <EditUserModal
                    userInfo={userInfo}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default UserInfo;