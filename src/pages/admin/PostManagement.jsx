import { useEffect, useState } from "react";
import { Plus } from "lucide-react"; // hoặc dùng icon khác nếu muốn
import PostForm from "@/components/PostForm.jsx";
import PostListManagement from "@/components/PostListManagement.jsx";

export default function PostManagement({ onNavigate }) {
  const [initialPostData, setInitialPostData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = "Thêm bài đăng";

    const previewData = sessionStorage.getItem("previewPost");
    if (previewData) {
      setInitialPostData(JSON.parse(previewData));
      setShowForm(true); // nếu có preview sẵn thì hiện luôn form
    }
  }, []);

  return (
    <div className="mt-1.5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý bài viết</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Đóng form" : "Thêm mới"}
        </button>
      </div>

      <PostListManagement />

      {showForm && (
        <div className="mt-6 border-t pt-4">
          <PostForm onNavigate={onNavigate} initialData={initialPostData} />
        </div>
      )}
    </div>
  );
}
