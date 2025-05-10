import React, { useState } from "react";
import { registerAccount, verifyAccount } from "../services/api";
import Button from "./ui/button";
import { useNavigate } from "react-router-dom";

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

  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Hàm xử lý đăng ký và gửi mã
  const handleRegister = async (e) => {
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
        setIsCodeSent(true); // Hiển thị phần nhập mã
        setSuccessMessage("Mã xác nhận đã được gửi đến email của bạn.");
      } else {
        setErrorMessage("Đăng ký thất bại, vui lòng thử lại.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Đã xảy ra lỗi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý xác minh mã
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setErrorMessage("Vui lòng nhập mã xác nhận.");
      return;
    }

    try {
      setIsRegistering(true);
      // Gửi tất cả thông tin cần thiết theo cấu trúc VerifyRequest
      const res = await verifyAccount({
        email: formData.email,
        code: verificationCode,
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        birthday: formData.birthday,
      });

      setSuccessMessage("Tài khoản đã được kích hoạt thành công!");
      setErrorMessage("");
      // Reset form sau khi xác minh thành công
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
      setVerificationCode("");
      setIsCodeSent(false);
      navigate("/login");
    } catch (err) {
      setErrorMessage(err.message || "Xác minh thất bại.");
      setSuccessMessage("");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 mt-5 mb-5">
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
        <form onSubmit={handleRegister}>
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã xác nhận:
          </label>
          <div className="flex items-start gap-2 mb-3">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-2/5 p-2 border border-gray-300 rounded-md"
            />
            <Button
              type="submit"
              className="w-3/5 p-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading
                ? "Đang gửi mã..."
                : isCodeSent
                ? "Gửi lại mã"
                : "Gửi mã"}
            </Button>
          </div>
        </form>

        {/* Nếu mã xác nhận đã được gửi */}

        <div className="mt-6">
          <Button
            onClick={handleVerifyCode}
            className="w-full p-2 rounded-md"
            disabled={isRegistering || !verificationCode}
          >
            {isRegistering ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Register;
