import React, { useState } from "react";
import { registerAccount } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    birthday: "",
    address: "",
    phone: "",
    gender: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu và xác nhận mật khẩu không khớp!");
      setIsLoading(false);
      return;
    }

    try {
      const response = await registerAccount(formData);
      if (response) {
        setSuccessMessage(
          "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ."
        );
      } else {
        setErrorMessage("Đăng ký thất bại, vui lòng thử lại.");
      }
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        birthday: "",
        address: "",
        phone: "",
        gender: "",
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Đăng Ký
        </h2>
        {errorMessage && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-500 text-sm text-center">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Trường thông tin cũ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Tên người dùng:
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Mật khẩu:
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Xác nhận mật khẩu:
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Các trường mới */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Họ và tên:
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ngày sinh:
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ:
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Số điện thoại:
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Giới tính:
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng Ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
