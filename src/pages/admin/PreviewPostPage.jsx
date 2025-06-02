import React, { useEffect, useState } from "react";
import { addPost, editPostById } from "@/services/apiadmin.jsx";
import {AlertCircle, CheckCircle, X} from "lucide-react";
import {useNavigate} from "react-router-dom";
export default function PreviewPostPage({ onNavigate}) {
    const [post, setPost] = useState(null);
    const [postId, setPostId] = useState(null);
    const [toast, setToast] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
        const previewPostData = sessionStorage.getItem("previewPost");
        const previewEditData = sessionStorage.getItem("previewEditPost");

        if (previewEditData) {
            const previewData = JSON.parse(previewEditData);
            setPost(previewData);
            setPostId(previewData.id);
        } else if (previewPostData) {
            setPost(JSON.parse(previewPostData));
        }
    }, []);
    const addToast = (message, type = "success") => {
        const id = Date.now(); // Tạo ID duy nhất cho mỗi toast
        setToast((prev) => [...prev, { id, message, type, show: true }]);

        // Tự động xóa toast sau 3 giây
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Hàm xóa toast
    const removeToast = (id) => {
        setToast((prev) =>
            prev.map((t) => (t.id === id ? { ...t, show: false } : t))
        );

        // Xóa toast khỏi mảng sau khi animation kết thúc
        setTimeout(() => {
            setToast((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    };

    // Component Toast Container để hiển thị nhiều toast
    const ToastContainer = () => {
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toast.map((t) => (
                    <ToastNotification
                        key={t.id}
                        id={t.id}
                        message={t.message}
                        type={t.type}
                        show={t.show}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        );
    };

    // Component Toast Notification cập nhật
    const ToastNotification = ({ id, message, type, show, onClose }) => {
        if (!show) return null;

        const typeStyles = {
            success: "bg-green-500",
            error: "bg-red-500",
        };

        return (
            <div
                className={`px-6 py-3 rounded-md shadow-lg flex items-center justify-between ${typeStyles[type]}`}
                style={{
                    animation: "fadeInOut 3s ease-in-out",
                    opacity: show ? 1 : 0,
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                }}
            >
                <div className="flex items-center">
                    {type === "success" ? (
                        <CheckCircle className="mr-2 h-5 w-5 text-white" />
                    ) : (
                        <AlertCircle className="mr-2 h-5 w-5 text-white" />
                    )}
                    <p className="text-white font-medium">{message}</p>
                </div>
                <button
                    className="text-white opacity-70 hover:opacity-100"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    };
    const handleSubmit = async () => {
        try {
            const formattedPost = {
                ...post,
                sections: post.sections.map((section, sectionIndex) => ({
                    heading: section.heading || `Phần ${sectionIndex + 1}`,
                    sectionOrder: sectionIndex + 1,
                    images: section.images.filter((img) => img?.toString().trim() !== ""),
                    paragraphs: section.paragraphs
                        .filter((p) => p?.toString().trim() !== "")
                        .map((p, pIndex) => ({
                            content: typeof p === "object" && p.content ? p.content : p,
                            paragraphOrder: pIndex + 1,
                        })),
                })),
            };

            if (postId) {
                await editPostById(postId, formattedPost);
                addToast("✅ Cập nhật bài viết thành công!",'success');
            } else {
                await addPost(formattedPost);
                addToast("✅ Đăng bài viết thành công!",'success');
            }

            sessionStorage.removeItem("previewPost");
            sessionStorage.removeItem("previewEditPost");
            setTimeout(() => {
                navigate("/admin?page=post");
            }, 1000);
        } catch (err) {
            console.error("Submit error:", err);
            addToast("❌ Đã xảy ra lỗi. Vui lòng thử lại.",'error');
        }
    };

    console.log("post: ", post)

    if (!post) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl p-8 text-center border border-white/20">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-xl text-gray-700 mb-6">Không có dữ liệu xem trước.</p>
                    <button
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2 mx-auto"
                        onClick={() => onNavigate(-1)}
                    >
                        ← Quay lại chỉnh sửa
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <ToastContainer />

            <div className="max-w-4xl mx-auto p-6">
                {/* Header with back button */}
                <div className="mb-8">
                    <button
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                        onClick={() => {
                            postId ? onNavigate("post-edit") : onNavigate("create-post")
                        }}
                    >
                        ← Quay lại chỉnh sửa
                    </button>
                </div>

                {/* Main content container */}
                <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20 overflow-hidden">
                    {/* Article header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">👁️</span>
                            <span className="text-lg font-medium bg-white/20 px-3 py-1 rounded-full">
                                XEM TRƯỚC
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">
                            {post.title || "Không có tiêu đề"}
                        </h1>
                    </div>

                    {/* Article content */}
                    <div className="p-8">
                        <div className="mb-8">
                            {post.postImage ? (
                                <div className="relative group">
                                    <div
                                        className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                    <div className="relative">
                                        <img
                                            src={typeof post.postImage === 'object' ? post.postImage : post.postImage}
                                            alt={post.title || "Ảnh bài viết"}
                                            className="w-full max-h-96 object-cover rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                        />
                                        <div
                                            className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                                            <span className="text-white text-sm font-medium">📸 Ảnh bài viết</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="bg-gray-50 p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
                                    <div className="text-6xl mb-4">🖼️</div>
                                    <p className="text-lg italic text-gray-400">Chưa có ảnh bài viết</p>
                                </div>
                            )}
                        </div>
                        {/* Intro paragraph */}
                        <div className="mb-8">
                            {post.introParagraph ? (
                                <div
                                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
                                    <p className="text-lg italic text-gray-700 leading-relaxed">
                                        {post.introParagraph}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-300">
                                    <p className="text-lg italic text-gray-400">Chưa có đoạn mở đầu</p>
                                </div>
                            )}
                        </div>

                        {/* Sections */}
                        {post.sections && post.sections.length > 0 ? (
                            post.sections.map((section, idx) => (
                                <section key={idx} className="mb-10">
                                    <div
                                        className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                                        {/* Section header */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <span
                                                className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {idx + 1}
                                            </span>
                                            <h2 className="text-2xl font-bold text-gray-800">
                                                {section.heading || `Phần ${idx + 1}`}
                                            </h2>
                                        </div>

                                        {/* Section paragraphs */}
                                        <div className="mb-6">
                                            {section.paragraphs && section.paragraphs.length > 0 ? (
                                                section.paragraphs.map((para, pIdx) => (
                                                    <p key={pIdx}
                                                       className="mb-4 text-gray-800 leading-relaxed text-lg">
                                                        {typeof para === 'object' && para.content ? para.content : para}
                                                    </p>
                                                ))
                                            ) : (
                                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                                    <p className="italic text-orange-600">📝 Chưa có đoạn văn nào</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Section images */}
                                        {section.images && section.images.length > 0 ? (
                                            <div className="space-y-6">
                                                {section.images.map((imgUrl, i) => (
                                                    <div key={i} className="flex justify-center">
                                                        <div className="relative group">
                                                            <div
                                                                className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                                            <div className="relative">
                                                                <img
                                                                    src={typeof imgUrl === 'object' ? imgUrl.url : imgUrl}
                                                                    alt={`Ảnh phần ${idx + 1} - ${i + 1}`}
                                                                    className="max-w-full max-h-96 w-auto h-auto rounded-xl shadow-xl object-contain transition-all duration-300 hover:scale-[1.02]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                                <p className="italic text-gray-400">🖼️ Chưa có hình ảnh</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            ))
                        ) : (
                            <div className="bg-red-50 p-8 rounded-2xl border border-red-200 text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <p className="text-xl italic text-red-600 font-medium">Chưa có phần nội dung nào</p>
                            </div>
                        )}

                        {/* Conclusion */}
                        <div className="mt-10 pt-8 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
                            {post.conclusion ? (
                                <div
                                    className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-l-4 border-green-500">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">🎯</span>
                                        <span className="font-bold text-gray-700">KẾT LUẬN</span>
                                    </div>
                                    <p className="text-lg font-medium text-gray-800 leading-relaxed">
                                        {post.conclusion}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-gray-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">🎯</span>
                                        <span className="font-bold text-gray-500">KẾT LUẬN</span>
                                    </div>
                                    <p className="text-lg italic text-gray-400">Chưa có kết luận</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer back button */}
                <div className="mt-8 text-center">
                    <button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2 mx-auto text-lg"
                        onClick={handleSubmit}
                    >
                        {postId ? '💾 Cập nhật bài viết' : '✨ Đăng bài viết'}
                    </button>
                </div>

            </div>
        </div>
    );
}