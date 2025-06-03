import { useNavigate } from "react-router-dom";
import { Calendar, ArrowRight, Film, Loader2, AlertCircle } from "lucide-react";
import { useNews } from "../contexts/NewsContext";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";
import React from "react"; // Đảm bảo context đã đổi tên đúng

const News = () => {
  const { news, loading } = useNews();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPostImage = (post) => {
    if (post.postImage) return post.postImage;
    for (const section of post.sections || []) {
      if (section.images && section.images.length > 0) {
        return section.images[0].url;
      }
    }
    return null;
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return "";
    return text.length <= maxLength
      ? text
      : text.substring(0, maxLength) + "...";
  };

  const handlePostClick = (postId) => {
    navigate(`/news/${postId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-gray-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Đang tải tin tức...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gray-600 rounded-full p-3 mr-4">
              <Film className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Tin Tức Phim</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Cập nhật những thông tin mới nhất về thế giới điện ảnh, phim hay và
            sự kiện tại rạp
          </p>
        </div>

        {/* News Grid */}
        {news.length === 0 ? (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Chưa có tin tức nào
            </h3>
            <p className="text-gray-500">
              Hãy quay lại sau để xem những tin tức mới nhất!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {news.map((post) => {
              const postImage = getPostImage(post);
              return (
                <div
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    {postImage ? (
                      <img
                        src={postImage || "/placeholder.svg"}
                        alt={post.title}
                        // className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"

                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Film className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <ArrowRight className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(post.createdAt)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                      {truncateText(
                        post.introParagraph ||
                          "Đọc thêm để khám phá nội dung thú vị..."
                      )}
                    </p>
                    <div className="mt-4 flex items-center text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                      <span className="text-sm font-medium">Đọc thêm</span>
                      <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button (nếu cần) */}
        {news.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              Xem thêm tin tức
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
