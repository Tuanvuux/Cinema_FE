import React, { useState } from "react";
import { login } from "../services/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ username, password });

      if (!response) {
        throw new Error("Có lỗi xảy ra, vui lòng thử lại!");
      }
      localStorage.setItem("token", response.token);
      alert(`Đăng nhập thành công!`);
      // localStorage.setItem("user", JSON.stringify(user));
      // window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          Đăng Nhập
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
              required
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
              required
              className="mt-1 block w-full p-2 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded-md flex justify-center items-center ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            disabled={isLoading}
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
