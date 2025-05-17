import React, { useEffect, useState } from "react";
import { getUserInfo, updateUserInfo } from "../services/api";

const UserInfo = () => {
  const [user, setUser] = useState(null);
  const [storedUser, setStoredUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    birthday: "",
    gender: "male",
    address: "",
    phone: "",
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      alert("Cập nhật thành công!");
    } catch (err) {
      setError("Lỗi khi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải thông tin...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-6 mt-10">
      <h2 className="text-2xl font-semibold mb-4">Thông tin người dùng</h2>

      <div className="space-y-4">
        {/* Thông tin KHÔNG CHO SỬA */}
        <div>
          <p>
            <strong>Email:</strong> {storedUser.email}
          </p>
        </div>

        {/* Thông tin CÓ THỂ SỬA */}
        <div>
          <label className="block font-medium">Họ tên:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Ngày sinh:</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Giới tính:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Số điện thoại:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
