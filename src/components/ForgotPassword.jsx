import React, { useState } from "react";
import { sendForgotPasswordEmail } from "../services/api";
import { Link } from "react-router-dom";
import Button from "./ui/button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Vui lòng nhập email!");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await sendForgotPasswordEmail(email);
      setMessage(
        "Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Gửi email thất bại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
          Khôi phục mật khẩu
        </h2>
        {message && (
          <div className="text-green-600 mb-3 text-sm">{message}</div>
        )}
        {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-2 rounded-md"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link to="/login" className="text-blue-600 hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
