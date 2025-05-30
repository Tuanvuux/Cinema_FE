import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../services/api"; // 👉 Import hàm đã tách
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token không hợp lệ hoặc đã hết hạn.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);
      await resetPasswordApi(token, newPassword); // 👉 Gọi API đã tách
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const msg = error.response?.data || "Có lỗi xảy ra khi đặt lại mật khẩu.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Đặt lại mật khẩu
        </h2>

        {errorMessage && (
          <div className="text-red-600 text-sm text-center mb-4">
            {errorMessage}
          </div>
        )}

        {success ? (
          <div className="text-green-600 text-center font-semibold">
            Mật khẩu đã được đặt lại. Đang chuyển hướng...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-[38px] text-gray-600"
                aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showNewPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700">
                Nhập lại mật khẩu
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-blue-300 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-[38px] text-gray-600"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
