import { useEffect, useState } from "react"
import { getUserInfo, updateUserInfo } from "../services/api"
import { User, Calendar, MapPin, Phone, Mail, Save, Loader2, CheckCircle, AlertCircle, UserCircle } from "lucide-react"

const UserInfo = () => {
  const [user, setUser] = useState(null)
  const [storedUser, setStoredUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastType, setToastType] = useState("success") // success or error
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    gender: "male",
    address: "",
    phone: "",
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"))
        if (!storedUser || !storedUser.userId) {
          setError("Không tìm thấy userId trong localStorage")
          setLoading(false)
          return
        }
        setStoredUser(storedUser)

        const data = await getUserInfo(storedUser.userId)
        setUser(data)

        setFormData({
          fullName: data.fullName || "",
          birthday: data.birthday ? data.birthday.split("T")[0] : "",
          gender: data.gender || "male",
          address: data.address || "",
          phone: data.phone || "",
        })
      } catch (err) {
        setError("Không thể tải thông tin người dùng")
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"))

      // Chuyển ngày sinh về định dạng "yyyy-MM-dd"
      const formattedBirthday = formData.birthday ? new Date(formData.birthday).toISOString().split("T")[0] : ""

      const payload = {
        ...formData,
        birthday: formattedBirthday,
      }

      const updatedUser = await updateUserInfo(storedUser.userId, payload)
      setUser((prev) => ({ ...prev, ...updatedUser }))

      // Show success toast
      setToastType("success")
      setToastMessage("Cập nhật thông tin thành công!")
      setShowToast(true)
    } catch (err) {
      setError("Lỗi khi cập nhật thông tin")

      // Show error toast
      setToastType("error")
      setToastMessage("Lỗi khi cập nhật thông tin")
      setShowToast(true)
    } finally {
      setSaving(false)
    }
  }

  return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
            <div
                className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
                    showToast ? "translate-x-0 opacity-100 scale-100" : "translate-x-full opacity-0 scale-95"
                }`}
            >
              <div
                  className={`px-6 py-4 rounded-xl shadow-2xl flex items-center min-w-[320px] border ${
                      toastType === "success"
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/20"
                          : "bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/20"
                  }`}
              >
                <div className="bg-white/20 rounded-full p-1 mr-3">
                  {toastType === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <span className="font-medium text-sm">{toastMessage}</span>
                <button
                    onClick={() => setShowToast(false)}
                    className="ml-auto text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-full p-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
        )}

        <div className="max-w-2xl mx-auto">
          {loading ? (
              <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-gray-900 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Đang tải thông tin người dùng...</p>
              </div>
          ) : error && !user ? (
              <div className="bg-white shadow-lg rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
          ) : (
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-6 text-white">
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-full p-3">
                      <UserCircle className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
                      <p className="text-gray-200">Quản lý thông tin cá nhân của bạn</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="p-8">
                  {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                  )}

                  <div className="space-y-6">
                    {/* Email - Không cho sửa */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="font-medium text-gray-800">{storedUser?.email || "Chưa cập nhật"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Thông tin có thể sửa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Họ tên */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Họ tên
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                            placeholder="Nhập họ tên của bạn"
                        />
                      </div>

                      {/* Ngày sinh */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          Ngày sinh
                        </label>
                        <input
                            type="date"
                            name="birthday"
                            value={formData.birthday}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                        />
                      </div>

                      {/* Giới tính */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          Giới tính
                        </label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="male"
                                checked={formData.gender === "male"}
                                onChange={handleChange}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Nam</span>
                          </label>
                          <label className="flex items-center">
                            <input
                                type="radio"
                                name="gender"
                                value="female"
                                checked={formData.gender === "female"}
                                onChange={handleChange}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">Nữ</span>
                          </label>
                        </div>
                      </div>

                      {/* Số điện thoại */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          Số điện thoại
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                            placeholder="Nhập số điện thoại"
                        />
                      </div>

                      {/* Địa chỉ - full width */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          Địa chỉ
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                            placeholder="Nhập địa chỉ của bạn"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                          onClick={handleSave}
                          disabled={saving}
                          className={`w-full md:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                              saving
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                          }`}
                      >
                        {saving ? (
                            <>
                              <Loader2 className="animate-spin h-5 w-5 mr-2" />
                              Đang lưu...
                            </>
                        ) : (
                            <>
                              <Save className="h-5 w-5 mr-2" />
                              Lưu thay đổi
                            </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}
        </div>
      </div>
  )
}

export default UserInfo
