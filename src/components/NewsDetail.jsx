import { useParams, useNavigate } from "react-router-dom";
import { Calendar, ArrowLeft, AlertCircle } from "lucide-react";
import { useNews } from "../contexts/NewsContext";
import React, { useEffect, useState } from "react";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

const NewsDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { news, loading, error } = useNews(); // Lấy từ context
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!loading && Array.isArray(news)) {
      const foundPost = news.find((p) => String(p.id) === String(postId));
      setPost(foundPost || null);
    }
  }, [loading, news, postId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              {error || "Không tìm thấy bài viết"}
            </p>
            <button
              onClick={() => navigate("/news")}
              className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ScrollToTopButton />
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/news")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại danh sách tin tức
        </button>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 text-white">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="text-gray-200">
                {post?.createdAt
                  ? formatDate(post.createdAt)
                  : "Không rõ ngày đăng"}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
            {post.introParagraph && (
              <p className="text-xl text-gray-200 mt-4 leading-relaxed">
                {post.introParagraph}
              </p>
            )}
          </div>

          <div className="p-8">
            {Array.isArray(post.sections) &&
              post.sections.map((section, sectionIndex) => (
                <div key={section.id || sectionIndex} className="mb-8">
                  {section.heading && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      {section.heading}
                    </h2>
                  )}

                  {Array.isArray(section.paragraphs) &&
                    section.paragraphs
                      .sort(
                        (a, b) =>
                          (a.paragraphOrder || 0) - (b.paragraphOrder || 0)
                      )
                      .map((paragraph, paragraphIndex) => (
                        <p
                          key={paragraph.id || paragraphIndex}
                          className="text-gray-700 leading-relaxed mb-4 text-lg"
                        >
                          {paragraph.content}
                        </p>
                      ))}

                  {Array.isArray(section.images) &&
                    section.images.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {section.images
                          .sort(
                            (a, b) => (a.imageOrder || 0) - (b.imageOrder || 0)
                          )
                          .map((image, imageIndex) => (
                            <div
                              key={image.id || imageIndex}
                              className="rounded-xl overflow-hidden shadow-lg"
                            >
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt={`Hình ảnh ${imageIndex + 1}`}
                                className="w-full h-auto object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              ))}

            {post.conclusion && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-700 leading-relaxed text-lg">
                  {post.conclusion}
                </p>
              </div>
            )}
          </div>
        </article>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/news")}
            className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Xem thêm tin tức khác
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
