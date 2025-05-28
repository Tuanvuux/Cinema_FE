import React, { useState, useEffect } from "react";
import { loginApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Button from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

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

      // Hiển thị toast thành công
      setSuccessMessage("Đăng nhập thành công!");
      setShowToast(true);

      // Chuyển hướng sau 2 giây
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);

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
        {/* Toast Notification */}
        {showToast && successMessage && (
            <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
                showToast ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
              <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center min-w-[300px]">
                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{successMessage}</span>
                <button
                    onClick={() => {
                      setShowToast(false);
                      setSuccessMessage("");
                    }}
                    className="ml-4 text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
        )}

        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            Đăng nhập ngay!
          </h2>

          {/* Error Message */}
          {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
              />
            </div>
            <p>Quên mật khẩu?</p>
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