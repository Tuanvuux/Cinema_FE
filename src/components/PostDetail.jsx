import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPostById } from "../services/apiadmin.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        setError("Không tìm thấy bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-2">Thể loại: {post.category}</p>
      <p className="text-sm text-gray-500 mb-4">
        Ngày tạo: {new Date(post.createdAt).toLocaleDateString()}
      </p>

      {post.sections?.map((section, index) => (
        <div key={index} className="mb-6">
          {section.subTitle && (
            <h2 className="text-xl font-semibold mb-2">{section.subTitle}</h2>
          )}
          {section.text && <p className="text-gray-800">{section.text}</p>}
          {section.imageUrl && (
            <img
              src={section.imageUrl}
              alt=""
              className="w-full max-w-xl mt-2 rounded"
            />
          )}
        </div>
      ))}
    </div>
  );
}
