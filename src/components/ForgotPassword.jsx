"use client"

import { useState } from "react"
import { sendForgotPasswordEmail } from "../services/api"
import { Link } from "react-router-dom"
import Button from "./ui/button"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    if (!email) {
      setError("Vui lòng nhập email!")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await sendForgotPasswordEmail(email)
      setMessage("Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.")
    } catch (err) {
      setError(err.response?.data?.message || "Gửi email thất bại!")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mb-4 shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Khôi phục mật khẩu</h2>
              <p className="text-gray-600 text-sm">Nhập email để nhận liên kết khôi phục mật khẩu</p>
            </div>

            {/* Success Message */}
            {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center animate-in slide-in-from-top-2 duration-300">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{message}</span>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                      placeholder="Nhập địa chỉ email của bạn"
                      disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                      isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  }`}
              >
                {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 text-white mr-2" />
                      Đang gửi...
                    </div>
                ) : (
                    "Gửi yêu cầu"
                )}
              </Button>

              {/* Back to Login Link */}
              <div className="text-center">
                <Link
                    to="/login"
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Không nhận được email?{" "}
              <button
                  onClick={() => window.location.reload()}
                  className="text-gray-600 hover:text-gray-700 font-medium hover:underline transition-colors duration-200"
              >
                Thử lại
              </button>
            </p>
          </div>
        </div>
      </div>
  )
}

export default ForgotPassword
