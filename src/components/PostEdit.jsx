import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, editPostById } from "../services/api";

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [postData, setPostData] = useState({
    title: "",
    category: "",
    introParagraph: "",
    conclusion: "",
    sections: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPostData(data);
      } catch (err) {
        setError("Không tải được bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Lưu bài viết sau khi sửa
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Gọi API sửa bài viết
      await editPostById(id, postData);
      alert("Cập nhật bài viết thành công!");
      navigate(`/admin/posts/${id}`); // Điều hướng về trang xem chi tiết
    } catch (err) {
      setError("Cập nhật bài viết thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Chỉnh sửa bài viết</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Tiêu đề</label>
        <input
          type="text"
          name="title"
          value={postData.title}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Thể loại</label>
        <input
          type="text"
          name="category"
          value={postData.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Đoạn mở đầu</label>
        <textarea
          name="introParagraph"
          value={postData.introParagraph}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Kết luận</label>
        <textarea
          name="conclusion"
          value={postData.conclusion}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* TODO: Bạn có thể mở rộng thêm UI để sửa phần sections nếu muốn */}

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
