import React, {useState, useEffect, useRef} from "react";
import { getPostById, editPostById } from "../services/apiadmin";
import { uploadImageToCloudinary } from "../services/cloudinary";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import {useNavigate, useLocation} from "react-router-dom";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import ScrollToTopButton from "@/pages/admin/ScrollToTopButton.jsx";

const PostEdit = ({ onNavigate, propPostId }) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState([]);
    const [postId, setPostId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.userId;
    const postImageInputRef = useRef(null);
    const ContentRef = useRef(null);

    // Fetch post data khi có postId
    useEffect(() => {
        let id = propPostId;
        const previewData = JSON.parse(sessionStorage.getItem("previewEditPost"));

        // From preview
        if(previewData){
            setPostId(previewData.id);
            const convertedPost = {
                ...previewData,
                updatedBy: userId,
                sections: previewData.sections.map(section => ({
                    ...section,
                    // Chuyển paragraphs từ object format về string format
                    paragraphs: section.paragraphs.map(para =>
                        typeof para === 'object' && para.content ? para.content : para
                    )
                }))
            };
            setPost(convertedPost);
            sessionStorage.removeItem("previewPost");
            setLoading(false);
        } else {
            //From management page
            if (!id) {
                const params = new URLSearchParams(location.search);
                id = params.get("postId");
            }

            if (id && id !== 'undefined') {
                setPostId(id);
                fetchPost(id);
                console.log('PostId set to:', id);
            } else {
                console.error('No valid postId found');
                addToast("Không tìm thấy ID bài viết", "error");
            }
        }
    }, [propPostId, location.search]);


    const fetchPost = async (id) => {

        try {
            setLoading(true);
            const postData = await getPostById(id);

            // Convert post data to form format
            const formattedPost = {
                id: postData.id,
                title: postData.title || "",
                postImage: postData.postImage || "",
                introParagraph: postData.introParagraph || "",
                conclusion: postData.conclusion || "",
                sections: postData.sections?.map(section => ({
                    heading: section.heading || "",
                    paragraphs: section.paragraphs?.map(p =>
                        typeof p === 'object' ? p.content : p
                    ) || [""],
                    images: section.images?.map(img =>
                        typeof img === 'object' ? img.url || img : img
                    ) || [""]
                })) || [
                    {
                        heading: "",
                        paragraphs: [""],
                        images: [""]
                    }
                ],
                updatedBy: userId,
            };

            setPost(formattedPost);
            document.title = `Chỉnh sửa bài viết #${id}`;
        } catch (error) {
            console.error("Error fetching post:", error);
            addToast("Lỗi khi tải bài viết", "error");
        } finally {
            setLoading(false);
        }
    };

    const addToast = (message, type = "success") => {
        const id = Date.now();
        setToast((prev) => [...prev, { id, message, type, show: true }]);

        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id) => {
        setToast((prev) =>
            prev.map((t) => (t.id === id ? { ...t, show: false } : t))
        );

        setTimeout(() => {
            setToast((prev) => prev.filter((t) => t.id !== id));
        }, 300);
    };

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

    const handleRemovePosterImage = () => {
        setPost(prevPost => ({
            ...prevPost,
            postImage: "" // Đặt postImage thành chuỗi rỗng để ẩn ảnh preview
        }));

        // Reset input file bằng cách đặt giá trị của nó thành rỗng
        if (postImageInputRef.current) {
            postImageInputRef.current.value = "";
        }

        addToast("Ảnh poster đã được xóa.", "success"); // Thông báo cho người dùng
    };


    const handleImageUpload = async (sectionIndex, imgIndex, file) => {
        if (!file) {
            // Nếu người dùng không chọn tệp (ví dụ, hủy hộp thoại), đảm bảo input file cũng được reset
            if (postImageInputRef.current) {
                postImageInputRef.current.value = "";
            }
            setPost({ ...post, postImage: "" }); // Đặt postImage thành rỗng nếu không có file
            return;
        }

        try {
            const imageUrl = await uploadImageToCloudinary(file);
            const updated = [...post.sections];
            updated[sectionIndex].images[imgIndex] = imageUrl;
            setPost({ ...post, sections: updated });
            addToast("Upload ảnh thành công!", "success");
        } catch (err) {
            console.error("Upload failed:", err);
            addToast("Lỗi khi upload ảnh. Vui lòng thử lại.", "error");
        }
    };
    const handlePosterImageUpload = async (file) => {
        if (!file) return;

        try {
            const imageUrl = await uploadImageToCloudinary(file);
            setPost({ ...post, postImage: imageUrl });
            addToast("Upload ảnh poster thành công!", 'success');
        } catch (err) {
            console.error("Upload failed:", err);
            addToast("Lỗi khi upload ảnh poster. Vui lòng thử lại.", 'error');
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
                id: section.id,
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
            await editPostById(postId, formattedPost);
            addToast("Cập nhật bài viết thành công!", "success");

            setTimeout(() => {
                if (onNavigate) {
                    onNavigate("post");
                } else {
                    navigate("/admin?page=post");
                }
            }, 1000);
        } catch (err) {
            console.error("Error updating post:", err);
            addToast("Lỗi khi cập nhật bài viết.", "error");
        }
    };

    const handlePreview = () => {
        const formattedPost = {
            ...post,
            sections: post.sections.map((section, sectionIndex) => ({
                id: section.id,
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

        sessionStorage.setItem("previewEditPost", JSON.stringify(formattedPost));
        if (onNavigate) onNavigate("preview");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                    {/* Animated spinner */}
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-blue-400 opacity-20"></div>
                    </div>

                    {/* Loading text with fade animation */}
                    <div className="text-lg text-gray-600 animate-pulse font-medium">
                        Đang tải bài viết...
                    </div>

                    {/* Loading dots animation */}
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4 text-center max-w-md">
                    {/* Error icon */}
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    {/* Error message */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Không tìm thấy bài viết
                        </h3>
                        <p className="text-gray-500">
                            Bài viết có thể đã bị xóa hoặc không tồn tại
                        </p>
                    </div>

                    {/* Action button */}
                    <button
                        onClick={() => {
                            if (onNavigate) {
                                onNavigate("post");
                            } else {
                                navigate("/admin?page=post");
                            }
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <ToastContainer/>
            <ScrollToTopButton containerRef={ContentRef} />
            <div className="flex h-full">
                <div ref={ContentRef} className="flex-1 p-4 md:p-6 overflow-auto">
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gradient-to-r from-blue-200 to-purple-200">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            CHỈNH SỬA BÀI VIẾT
                        </h1>
                        <div
                            className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
                            <UserInfo className="w-full md:w-auto"/>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-8 max-w-4xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-2xl border border-white/20 transition-all duration-300 hover:shadow-3xl"
                    >
                        <div
                            className="flex items-center justify-between pb-4 border-b border-gradient-to-r from-blue-200 to-purple-200">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-gray-600 bg-clip-text text-transparent">
                                ✏️ Chỉnh sửa bài viết
                            </h2>
                            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                🆔 ID: {postId}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề chính</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Nhập tiêu đề bài viết..."
                                value={post.title}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">📷 Ảnh Poster</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={postImageInputRef}
                                    onChange={(e) => handlePosterImageUpload(e.target.files[0])}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-all file:duration-300"
                                />
                            </div>

                            {post.postImage && (
                                <div className="relative mt-4 group">
                                    <div
                                        className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                        <img
                                            src={post.postImage}
                                            alt="poster-preview"
                                            className="w-full max-w-md h-auto rounded-xl mx-auto"
                                        />
                                    </div>
                                    <div
                                        className="mt-2 text-sm text-gray-600 bg-gray-100 rounded-lg p-2 truncate text-center">
                                        📎 {post.postImage.split("/").pop()}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemovePosterImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                                    >
                                        ❌
                                    </button>
                                </div>
                            )}
                        </div>


                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Đoạn mở đầu</label>
                            <textarea
                                name="introParagraph"
                                placeholder="Viết đoạn mở đầu hấp dẫn..."
                                value={post.introParagraph}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300 resize-none"
                                rows="3"
                            />
                        </div>

                        {post.sections && post.sections.map((section, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                className="border-2 border-gray-200 p-6 rounded-2xl bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm space-y-4 relative shadow-lg hover:shadow-xl transition-all duration-300 group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeSection(sectionIndex)}
                                    className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 opacity-80 group-hover:opacity-100"
                                >
                                    🗑️
                                </button>

                                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                        <span
                            className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {sectionIndex + 1}
                        </span>
                                    Phần {sectionIndex + 1}
                                </h3>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề
                                        phụ</label>
                                    <input
                                        type="text"
                                        placeholder="Nhập tiêu đề phụ..."
                                        value={section.heading}
                                        onChange={(e) =>
                                            handleSectionChange(sectionIndex, "heading", e.target.value)
                                        }
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                                        📝 Đoạn văn:
                                    </p>
                                    {section.paragraphs.map((p, i) => (
                                        <div key={i} className="relative group/paragraph">
                                <textarea
                                    value={p}
                                    onChange={(e) =>
                                        handleParagraphChange(sectionIndex, i, e.target.value)
                                    }
                                    placeholder={`Viết nội dung đoạn văn ${i + 1}...`}
                                    className="w-full p-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300 resize-none"
                                    rows="3"
                                />
                                            <button
                                                type="button"
                                                onClick={() => removeParagraph(sectionIndex, i)}
                                                className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 opacity-70 group-hover/paragraph:opacity-100"
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => addParagraph(sectionIndex)}
                                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-all duration-300 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100"
                                    >
                                        ➕ Thêm đoạn văn
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <p className="font-semibold text-gray-700 flex items-center gap-2">
                                        🖼️ Hình ảnh:
                                    </p>
                                    {section.images.map((img, i) => (
                                        <div key={i} className="relative group/image">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handleImageUpload(sectionIndex, i, e.target.files[0])
                                                    }
                                                    className="w-full p-4 pr-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-all duration-300 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-all file:duration-300"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(sectionIndex, i)}
                                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110 opacity-70 group-hover/image:opacity-100"
                                                >
                                                    ❌
                                                </button>
                                            </div>

                                            {img && (
                                                <div className="relative mt-4 group">
                                                    <div
                                                        className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                                        <img
                                                            src={typeof img === 'object' ? img.url : img}
                                                            alt={`preview-${i}`}
                                                            className="w-full max-w-xs h-auto rounded-xl"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {img && img.length !== 0 && (
                                                <div
                                                    className="mt-2 text-sm text-gray-600 bg-gray-100 rounded-lg p-2 truncate">
                                                    📎 Ảnh hiện tại: {typeof img === 'object' && img.url
                                                    ? img.url.split("/").pop()
                                                    : typeof img === 'string'
                                                        ? img.split("/").pop()
                                                        : 'Không xác định'
                                                }
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => addImage(sectionIndex)}
                                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline font-medium transition-all duration-300 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100"
                                    >
                                        🖼️ Thêm ảnh
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={addSection}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium flex items-center gap-2 mx-auto"
                            >
                                ➕ Thêm phần mới
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Kết luận</label>
                            <textarea
                                name="conclusion"
                                placeholder="Viết phần kết luận..."
                                value={post.conclusion}
                                onChange={handleChange}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/70 backdrop-blur-sm placeholder-gray-400 hover:border-gray-300 resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200">
                            <button
                                type="submit"
                                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                            >
                                💾 Cập nhật bài viết
                            </button>

                            <button
                                type="button"
                                onClick={handlePreview}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                            >
                                👁️ Xem trước
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate("post");
                                    } else {
                                        navigate("/admin?page=post");
                                    }
                                }}
                                className="bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center gap-2"
                            >
                                ← Quay lại
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>


    );
};

export default PostEdit;