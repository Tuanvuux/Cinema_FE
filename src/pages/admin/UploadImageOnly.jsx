import { useState } from "react";
import { uploadImageToCloudinary } from "@/services/cloudinary.jsx";

export default function UploadImageOnly() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [message, setMessage] = useState("");

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Vui lòng chọn ảnh trước!");
            return;
        }

        setUploading(true);
        try {
            const url = await uploadImageToCloudinary(selectedFile);
            setImageUrl(url);
            setMessage("Tải ảnh lên thành công!");
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
            setMessage("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-black text-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold text-center mb-4">Tải Ảnh Lên</h2>

            {message && <p className="text-center text-green-400">{message}</p>}

            <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full p-2 border rounded bg-gray-800 text-white mb-4"
            />

            <button
                onClick={handleUpload}
                className="w-full bg-gray-700 text-white p-2 rounded hover:bg-gray-600 mb-4"
                disabled={!selectedFile || uploading}
            >
                {uploading ? "Đang tải ảnh..." : "Tải ảnh lên"}
            </button>

            {imageUrl && (
                <div className="text-center mt-4">
                    <p className="mb-2 text-green-400">Link ảnh Cloudinary:</p>
                    <a
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 break-words underline"
                    >
                        {imageUrl}
                    </a>
                </div>
            )}
        </div>
    );
}
