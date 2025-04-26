import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from "../services/cloudinary";
import { addMovie, getCategories } from "@/services/apiadmin.jsx";

export default function AddMovieForm() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách thể loại:", error);
    }
  };
  const uploadImage = async (file, field) => {
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setValue(field, url); // Lưu URL ảnh vào form
    } catch (error) {
      alert("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // Hàm tải video lên Cloudinary
  const uploadVideo = async (file) => {
    setUploading(true);
    try {
      const url = await uploadVideoToCloudinary(file);
      setValue("trailerUrl", url); // Lưu URL video vào form
      setVideoPreview(url); // Hiển thị video preview
    } catch (error) {
      alert("Tải video thất bại!");

      // Hàm tải ảnh lên Cloudinary
      const uploadImage = async (file, field) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "cinema_booking"); // Thay bằng upload preset của bạn

        setUploading(true);
        try {
          const res = await axios.post(
            "https://api.cloudinary.com/v1_1/democloud/image/upload",
            formData
          );
          setValue(field, res.data.secure_url); // Gán URL ảnh vào form
        } catch (error) {
          console.error("Lỗi khi tải ảnh lên:", error);
          alert("Tải ảnh thất bại!");
        } finally {
          setUploading(false);
        }
      };

      // Xử lý gửi form
      const onSubmit = async (data) => {
        const formattedData = {
          ...data,
          category: { categoryId: data.categoryId },
        };

        try {
          await addMovie(formattedData);
          console.log("Dữ liệu phim gửi đi:", formattedData);
          setMessage("Thêm phim thành công!");
          reset();
          setVideoPreview("");
        } catch (error) {
          setMessage("Thêm phim thất bại: " + error.message);
        }
      };

      return (
        <div className="max-w-lg mx-auto p-6 bg-black shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Thêm Phim Mới
          </h2>
          {message && <p className="text-center text-green-600">{message}</p>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              {...register("name", { required: true })}
              type="text"
              placeholder="Tên phim"
              className="w-full p-2 border rounded"
            />
            <input
              {...register("director")}
              type="text"
              placeholder="Đạo diễn"
              className="w-full p-2 border rounded"
            />
            <input
              {...register("actor")}
              type="text"
              placeholder="Diễn viên"
              className="w-full p-2 border rounded"
            />
            <textarea
              {...register("description")}
              placeholder="Mô tả phim"
              className="w-full p-2 border rounded"
            ></textarea>
            <input
              {...register("duration", { required: true })}
              type="number"
              placeholder="Thời lượng (phút)"
              className="w-full p-2 border rounded"
            />
            <input
              {...register("releaseDate")}
              type="date"
              className="w-full p-2 border rounded"
            />

            {/* Upload Poster */}
            <label className="block font-semibold">Poster:</label>
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files[0], "posterUrl")}
              className="w-full p-2 border rounded"
            />
            {uploading && <p className="text-blue-500">Đang tải ảnh lên...</p>}

            {/* Upload Banner */}
            <label className="block font-semibold">Banner:</label>
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files[0], "bannerUrl")}
              className="w-full p-2 border rounded"
            />

            {/* Upload Trailer Thumbnail */}
            <label className="block font-semibold">Thumbnail Trailer:</label>
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files[0], "trailerUrl")}
              className="w-full p-2 border rounded"
            />

            <input
              {...register("ageLimit")}
              type="number"
              placeholder="Giới hạn tuổi"
              className="w-full p-2 border rounded"
            />
            <input
              {...register("caption")}
              placeholder="Ngôn ngữ"
              type="text"
              className="w-full p-2 border rounded"
            />

            {/* Upload Poster */}
            <label className="block font-semibold">Poster:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files[0], "posterUrl")}
              className="w-full p-2 border rounded"
            />

            {/* Upload Banner */}
            <label className="block font-semibold">Banner:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files[0], "bannerUrl")}
              className="w-full p-2 border rounded"
            />

            {/* Upload Trailer */}
            <label className="block font-semibold">Trailer:</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => uploadVideo(e.target.files[0])}
              className="w-full p-2 border rounded"
            />

            {/* Hiển thị video sau khi tải lên */}
            {videoPreview && (
              <video className="w-full mt-2" controls>
                <source src={videoPreview} type="video/mp4" />
                Trình duyệt của bạn không hỗ trợ video.
              </video>
            )}

            {/* Dropdown danh mục lấy từ database */}
            <label className="block font-semibold">Thể loại:</label>
            <select
              {...register("categoryId", { required: true })}
              className="w-full p-2 border rounded"
            >
              <option value="">Chọn thể loại</option>
              {categories.map((category) => (
                <option
                  className="bg-black"
                  key={category.categoryId}
                  value={category.categoryId}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={uploading}
              className={`w-full ${
                uploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
              } text-white p-2 rounded`}
            >
              {uploading ? "Đang tải..." : "Thêm Phim"}
            </button>
          </form>
        </div>
      );
    }
  };
}
