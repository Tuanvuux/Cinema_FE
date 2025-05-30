import React, { useEffect, useState } from "react";

export default function PreviewPostPage({ onNavigate }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    const previewData = sessionStorage.getItem("previewPost");
    if (previewData) {
      setPost(JSON.parse(previewData));
    }
  }, []);

  if (!post) {
    return (
      <div className="p-4">
        <p>Không có dữ liệu xem trước.</p>
        <button
          className="mt-2 px-4 py-2 bg-gray-200 rounded"
          onClick={() => onNavigate("post")}
        >
          Quay lại chỉnh sửa
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 rounded"
        onClick={() => onNavigate("post")}
      >
        ← Quay lại chỉnh sửa
      </button>

      <h1 className="text-3xl font-bold mb-2">
        {post.title || "Không có tiêu đề"}
      </h1>

      {post.introParagraph ? (
        <p className="mb-4 italic text-gray-700">{post.introParagraph}</p>
      ) : (
        <p className="mb-4 italic text-gray-400">Chưa có đoạn mở đầu</p>
      )}

      {post.sections && post.sections.length > 0 ? (
        post.sections.map((section, idx) => (
          <section key={idx} className="mb-6  p-4">
            <h2 className="text-xl font-semibold mb-2">
              {section.heading || `Phần ${idx + 1}`}
            </h2>

            {section.paragraphs && section.paragraphs.length > 0 ? (
              section.paragraphs.map((para, pIdx) => (
                <p key={pIdx} className="mb-2 text-gray-800">
                  {para.content}
                </p>
              ))
            ) : (
              <p className="italic text-gray-400 mb-2">Chưa có đoạn văn nào</p>
            )}

            {section.images && section.images.length > 0 ? (
              <div className="flex flex-wrap gap-3 mt-2">
                {section.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`Ảnh phần ${idx + 1} - ${i + 1}`}
                    className="w-40 h-auto rounded shadow"
                  />
                ))}
              </div>
            ) : (
              <p className="italic text-gray-400 mt-2">Chưa có hình ảnh</p>
            )}
          </section>
        ))
      ) : (
        <p className="italic text-red-500">Chưa có phần nội dung nào</p>
      )}

      {post.conclusion ? (
        <p className="mt-6 font-semibold">{post.conclusion}</p>
      ) : (
        <p className="mt-6 italic text-gray-400">Chưa có kết luận</p>
      )}
    </div>
  );
}
