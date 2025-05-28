import React, { useState } from "react";
import { loginApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Button from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // ✅ login từ context
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginApi({ username, password });

      if (!response || !response.token) {
        throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
      }

      // Lưu token
      localStorage.setItem("token", response.token);

      // Lưu thông tin người dùng
      const userInfo = {
        userId: response.userId,
        username: response.username,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
        gender: response.gender,
      };

      // Gọi context login
      login(userInfo);

      alert("Đăng nhập thành công!");
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đăng nhập thất bại!";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[url('/background_login.jpg')] bg-cover bg-center bg-no-repeat">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Đăng nhập ngay!
        </h2>
        {errorMessage && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Tên đăng nhập:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900">
              Mật khẩu:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <p className="text-right text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </p>
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-md flex justify-center items-center ${
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
              "Đăng Nhập"
            )}
          </Button>
          <p className="text-center">hoặc</p>
          <p>
            Chưa có tài khoản?{" "}
            <Link to={`/register`} className="font-bold">
              đăng ký ngay.
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
