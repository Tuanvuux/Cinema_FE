import React, { useState, useEffect } from "react";
import { addPost } from "../services/apiadmin";
import { uploadImageToCloudinary } from "../services/cloudinary";

const PostForm = ({ onNavigate, initialData }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const [post, setPost] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("previewPost");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;

    if (saved) {
      const parsed = JSON.parse(saved);
      setPost({ ...parsed, createdBy: userId });
    } else {
      setPost({
        title: "",
        category: "MOVIE_NEWS",
        introParagraph: "",
        conclusion: "",
        sections: [
          {
            heading: "",
            paragraphs: [""],
            images: [""],
          },
        ],
        createdBy: userId,
      });
    }
  }, []);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...post.sections];
    updated[index][field] = value;
    setPost({ ...post, sections: updated });
  };

  const handleParagraphChange = (sectionIndex, paraIndex, value) => {
    const updated = [...post.sections];
    updated[sectionIndex].paragraphs[paraIndex] = value;
    setPost({ ...post, sections: updated });
  };

  const handleImageUpload = async (sectionIndex, imgIndex, file) => {
    if (!file) return;

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      const updated = [...post.sections];
      updated[sectionIndex].images[imgIndex] = imageUrl;
      setPost({ ...post, sections: updated });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
    }
  };

  const addSection = () => {
    setPost({
      ...post,
      sections: [
        ...post.sections,
        { heading: "", paragraphs: [""], images: [""] },
      ],
    });
  };

  const addParagraph = (sectionIndex) => {
    const updated = [...post.sections];
    updated[sectionIndex].paragraphs.push("");
    setPost({ ...post, sections: updated });
  };

  const addImage = (sectionIndex) => {
    const updated = [...post.sections];
    updated[sectionIndex].images.push("");
    setPost({ ...post, sections: updated });
  };

  const removeParagraph = (sectionIndex, paraIndex) => {
    const updated = [...post.sections];
    updated[sectionIndex].paragraphs.splice(paraIndex, 1);
    setPost({ ...post, sections: updated });
  };

  const removeImage = (sectionIndex, imgIndex) => {
    const updated = [...post.sections];
    updated[sectionIndex].images.splice(imgIndex, 1);
    setPost({ ...post, sections: updated });
  };

  const removeSection = (sectionIndex) => {
    const updated = [...post.sections];
    updated.splice(sectionIndex, 1);
    setPost({ ...post, sections: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPost = {
      ...post,
      sections: post.sections.map((section, sectionIndex) => ({
        heading: section.heading || `Phần ${sectionIndex + 1}`,
        sectionOrder: sectionIndex + 1,
        images: section.images.filter((img) => img.trim() !== ""),
        paragraphs: section.paragraphs
          .filter((p) => p.trim() !== "")
          .map((p, pIndex) => ({
            content: p,
            paragraphOrder: pIndex + 1,
          })),
      })),
    };

    try {
      await addPost(formattedPost);
      alert("Đăng bài viết thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng bài viết.");
    }
  };

  const handlePreview = () => {
    const formattedPost = {
      ...post,
      sections: post.sections.map((section, sectionIndex) => ({
        heading: section.heading || `Phần ${sectionIndex + 1}`,
        sectionOrder: sectionIndex + 1,
        images: section.images.filter((img) => img.trim() !== ""),
        paragraphs: section.paragraphs
          .filter((p) => p.trim() !== "")
          .map((p, pIndex) => ({
            content: p,
            paragraphOrder: pIndex + 1,
          })),
      })),
    };

    sessionStorage.setItem("previewPost", JSON.stringify(formattedPost));
    if (onNavigate) onNavigate("preview");
  };
  if (!post) return <div className="p-4">Đang tải bài viết...</div>;
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 max-w-4xl mx-auto bg-white shadow rounded"
    >
      <h2 className="text-xl font-bold">Tạo bài viết</h2>

      <input
        type="text"
        name="title"
        placeholder="Tiêu đề chính"
        value={post.title}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      <select
        name="category"
        value={post.category}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="MOVIE_NEWS">Tin tức phim</option>
        <option value="PROMOTION">Ưu đãi</option>
      </select>

      <textarea
        name="introParagraph"
        placeholder="Đoạn mở đầu"
        value={post.introParagraph}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        rows="3"
      />

      {post.sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="border p-4 rounded bg-gray-50 space-y-3 relative"
        >
          <button
            type="button"
            onClick={() => removeSection(sectionIndex)}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
          >
            🗑 Xóa phần này
          </button>

          <h3 className="font-semibold">Phần {sectionIndex + 1}</h3>

          <input
            type="text"
            placeholder="Tiêu đề phụ"
            value={section.heading}
            onChange={(e) =>
              handleSectionChange(sectionIndex, "heading", e.target.value)
            }
            className="w-full p-2 border rounded"
          />

          <div>
            <p className="font-medium mb-1">Đoạn văn:</p>
            {section.paragraphs.map((p, i) => (
              <div key={i} className="relative">
                <textarea
                  value={p}
                  onChange={(e) =>
                    handleParagraphChange(sectionIndex, i, e.target.value)
                  }
                  placeholder={`Đoạn văn ${i + 1}`}
                  className="w-full mb-2 p-2 border rounded pr-10"
                  rows="2"
                />
                <button
                  type="button"
                  onClick={() => removeParagraph(sectionIndex, i)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addParagraph(sectionIndex)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Thêm đoạn văn
            </button>
          </div>

          <div>
            <p className="font-medium mb-1">Hình ảnh (URL):</p>
            {section.images.map((img, i) => (
              <div key={i} className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(sectionIndex, i, e.target.files[0])
                  }
                  className="w-full mb-2 p-2 border rounded pr-10"
                />
                {img && (
                  <div className="text-sm text-gray-500 truncate">
                    Đã chọn ảnh: {img.split("/").pop()}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(sectionIndex, i)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addImage(sectionIndex)}
              className="text-sm text-blue-600 hover:underline"
            >
              + Thêm ảnh
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        + Thêm phần mới
      </button>

      <textarea
        name="conclusion"
        placeholder="Kết luận"
        value={post.conclusion}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        rows="2"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Đăng bài viết
        </button>

        <button
          type="button"
          onClick={handlePreview}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Xem trước
        </button>
      </div>
    </form>
  );
};

export default PostForm;
