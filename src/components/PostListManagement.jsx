import React, { useEffect, useState } from "react";
import { getPosts } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PostListManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Hàm gọi API lấy danh sách bài viết
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts();
      console.log("data", data);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Lấy danh sách bài viết thất bại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Tiêu đề</th>
              <th className="border px-3 py-2 text-left">Thể loại</th>
              <th className="border px-3 py-2 text-left">Ngày tạo</th>
              <th className="border px-3 py-2 text-left">Ngày cập nhật</th>
              <th className="border px-3 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(posts) && posts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  Không có bài viết nào.
                </td>
              </tr>
            )}

            {Array.isArray(posts) &&
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{post.id}</td>
                  <td className="border px-3 py-2">
                    {post.title || "Không có tiêu đề"}
                  </td>
                  <td className="border px-3 py-2">{post.category}</td>
                  <td className="border px-3 py-2">
                    {post.createdAt
                      ? new Date(post.createdAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="border px-3 py-2">
                    {post.updatedAt
                      ? new Date(post.updatedAt).toLocaleDateString()
                      : ""}
                  </td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => navigate(`/admin/posts/${post.id}`)}
                    >
                      Xem
                    </button>
                    <button
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
