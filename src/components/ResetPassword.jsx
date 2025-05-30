import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { resetPasswordApi } from "../services/api"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react"

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setErrorMessage("Token không hợp lệ hoặc đã hết hạn.")
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng nhập đầy đủ mật khẩu.")
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.")
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.")
      return
    }

    try {
      setLoading(true)
      await resetPasswordApi(token, newPassword)
      setSuccess(true)
      setTimeout(() => navigate("/login"), 3000)
    } catch (error) {
      const msg = error.response?.data || "Có lỗi xảy ra khi đặt lại mật khẩu."
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:shadow-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
              <p className="text-gray-600 text-sm">Tạo mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
            )}

            {/* Success State */}
            {success ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Thành công!</h3>
                  <p className="text-green-600 font-medium mb-4">Mật khẩu đã được đặt lại thành công.</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang chuyển hướng đến trang đăng nhập...</span>
                  </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                          placeholder="Nhập mật khẩu mới"
                          disabled={loading}
                      />
                      <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          disabled={loading}
                      >
                        {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Nhập lại mật khẩu</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500"
                          placeholder="Xác nhận mật khẩu mới"
                          disabled={loading}
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Yêu cầu mật khẩu:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li className={`flex items-center ${newPassword.length >= 6 ? "text-green-600" : ""}`}>
                        <div
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        Ít nhất 6 ký tự
                      </li>
                      <li
                          className={`flex items-center ${newPassword && confirmPassword && newPassword === confirmPassword ? "text-green-600" : ""}`}
                      >
                        <div
                            className={`w-1.5 h-1.5 rounded-full mr-2 ${newPassword && confirmPassword && newPassword === confirmPassword ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        Mật khẩu xác nhận khớp
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                      type="submit"
                      disabled={loading || !token}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                          loading || !token
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="animate-spin h-5 w-5 text-white mr-2" />
                          Đang xử lý...
                        </div>
                    ) : (
                        "Xác nhận đặt lại"
                    )}
                  </button>
                </form>
            )}
          </div>

          {/* Security Note */}
          {!success && (
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Sau khi đặt lại mật khẩu, bạn sẽ được chuyển hướng đến trang đăng nhập
                </p>
              </div>
          )}
        </div>
      </div>
  )
}

export default ResetPassword
