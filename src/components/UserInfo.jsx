import { useEffect, useState } from "react";
import {
  getUserInfo,
  updateUserInfo,
  changePasswordApi,
} from "../services/api";
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  UserCircle,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [storedUser, setStoredUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success or error
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    gender: "male",
    address: "",
    phone: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.userId) {
          setError("Không tìm thấy userId trong localStorage");
          setLoading(false);
          return;
        }
        setStoredUser(storedUser);

        const data = await getUserInfo(storedUser.userId);
        setUser(data);

        setFormData({
          fullName: data.fullName || "",
          birthday: data.birthday ? data.birthday.split("T")[0] : "",
          gender: data.gender || "male",
          address: data.address || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Auto hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    setPasswordError("");

    // Validation
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    setChangingPassword(true);

    try {
      // Call API to change password (you'll need to implement this)
      await changePasswordApi(
        storedUser.userId,
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      setToastType("success");
      setToastMessage("Đổi mật khẩu thành công!");
      setShowToast(true);
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError("Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Chuyển ngày sinh về định dạng "yyyy-MM-dd"
      const formattedBirthday = formData.birthday
        ? new Date(formData.birthday).toISOString().split("T")[0]
        : "";

      const payload = {
        ...formData,
        birthday: formattedBirthday,
      };

      const updatedUser = await updateUserInfo(storedUser.userId, payload);
      setUser((prev) => ({ ...prev, ...updatedUser }));

      // Show success toast
      setToastType("success");
      setToastMessage("Cập nhật thông tin thành công!");
      setShowToast(true);
    } catch (err) {
      setError("Lỗi khi cập nhật thông tin");

      // Show error toast
      setToastType("error");
      setToastMessage("Lỗi khi cập nhật thông tin");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out ${
            showToast
              ? "translate-x-0 opacity-100 scale-100"
              : "translate-x-full opacity-0 scale-95"
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
              {toastType === "success" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
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
            <p className="text-gray-600 font-medium">
              Đang tải thông tin người dùng...
            </p>
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
                  <p className="text-gray-200">
                    Quản lý thông tin cá nhân của bạn
                  </p>
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
                      <p className="font-medium text-gray-800">
                        {storedUser?.email || "Chưa cập nhật"}
                      </p>
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

                {/* Action Buttons */}
                <div className="pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform ${
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

                    <button
                      onClick={() => navigate("/paymentHistory")}
                      className={`flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      `}
                    >
                      <History className="h-5 w-5 mr-2" />
                      Lịch sử giao dịch
                    </button>

                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
          <div className="fixed inset-0 bg-gray-800/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center">
                    <svg
                        className="h-6 w-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Đổi mật khẩu
                  </h3>
                  <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordError("");
                      }}
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors duration-200"
                  >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {passwordError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                )}

                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                          type={showCurrentPassword ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                          placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showCurrentPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                          type={showNewPassword ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                      />
                      <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showNewPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                          placeholder="Nhập lại mật khẩu mới"
                      />
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3 mt-6">
                  <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPasswordError("");
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Hủy
                  </button>
                  <button
                      onClick={handlePasswordSubmit}
                      disabled={changingPassword}
                      className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all duration-200 ${
                          changingPassword
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                      }`}
                  >
                    {changingPassword ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                          Đang đổi...
                        </>
                    ) : (
                        "Đổi mật khẩu"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default UserInfo;
