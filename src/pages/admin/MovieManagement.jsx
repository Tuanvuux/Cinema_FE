import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import React, { useEffect, useState, useRef } from "react";
import {
  deleteMovie,
  addMovie,
  getCategories,
  updateMovie,
  toggleDeleteStatus,
} from "@/services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { getMovies } from "@/services/api.jsx";
import {
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
} from "@/services/cloudinary";

export default function MovieManagement() {
  const [movies, setMovie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [videoPreview, setVideoPreview] = useState("");
  const [posterPreview, setPosterPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMovieForAction, setSelectedMovieForAction] = useState(null);
  const [actionType, setActionType] = useState("delete"); // 'delete' hoặc 'restore'

  const [categories, setCategories] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState({
    movieId: "",
    name: "",
    director: "",
    actor: "",
    description: "",
    country: "",
    duration: "",
    releaseDate: "",
    ageLimit: "",
    caption: "",
    posterUrl: "",
    bannerUrl: "",
    trailerUrl: "",
    categoryName: "",
    isDelete: false,
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkRestoreModalOpen, setBulkRestoreModalOpen] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState([]);
  const [toast, setToast] = useState([]);

  const modalConfirmRef = useRef();
  const modalEditRef = useRef();
  const modalbulkDeRef = useRef();
  const modalbulkReRef = useRef();
  const modalAddRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng Confirm Modal
      if (
        isConfirmModalOpen &&
        modalConfirmRef.current &&
        !modalConfirmRef.current.contains(event.target)
      ) {
        setConfirmModalOpen(false);
        setSelectedMovieForAction(null);
      }
      if (
        bulkDeleteModalOpen &&
        modalbulkDeRef.current &&
        !modalbulkDeRef.current.contains(event.target)
      ) {
        setBulkDeleteModalOpen(false);
      }
      if (
        bulkRestoreModalOpen &&
        modalbulkReRef.current &&
        !modalbulkReRef.current.contains(event.target)
      ) {
        setBulkRestoreModalOpen(false);
      }

      if (
        showEditModal &&
        modalEditRef.current &&
        !modalEditRef.current.contains(event.target)
      ) {
        handleCancel();
        setShowEditModal(false);
      }

      if (
        showAddModal &&
        modalAddRef.current &&
        !modalAddRef.current.contains(event.target)
      ) {
        handleCancel();
        setShowAddModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isConfirmModalOpen,
    bulkDeleteModalOpen,
    showEditModal,
    bulkRestoreModalOpen,
    showAddModal,
  ]);

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

  const handleOpenDeleteModal = (movieId) => {
    setSelectedMovieId(movieId);
    setDeleteModalOpen(true);
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setSelectedMovieId(null);
  };

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
      setValue(field, url);

      // Set the appropriate preview based on which field is being updated
      if (field === "posterUrl") {
        setPosterPreview(url);
      } else if (field === "bannerUrl") {
        setBannerPreview(url);
      }
    } catch (error) {
      alert("Tải ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const uploadVideo = async (file) => {
    setUploading(true);
    try {
      const url = await uploadVideoToCloudinary(file);
      setValue("trailerUrl", url);
      setVideoPreview(url);
    } catch (error) {
      alert("Tải video thất bại!");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {
    // Validation cho file uploads
    if (!posterPreview) {
      addToast("Vui lòng chọn poster!", "error");
      return;
    }

    if (!bannerPreview) {
      addToast("Vui lòng chọn banner!", "error");
      return;
    }

    if (!videoPreview) {
      addToast("Vui lòng chọn trailer!", "error");
      return;
    }

    const formattedData = {
      ...data,
      category: { categoryId: data.categoryId },
    };

    try {
      const newMovie = await addMovie(formattedData);
      setMovie((prevMovies) => [...prevMovies, newMovie]);
      console.log("Dữ liệu phim gửi đi:", formattedData);
      setMessage("Thêm phim thành công!");
      setShowAddModal(false);
      addToast("Thêm phim thành công!", "success");
    } catch (error) {
      addToast("Thêm phim thất bại!", "error");
      console.error(error);
    }
  };

  const handleCancel = () => {
    reset();
    setVideoPreview("");
    setPosterPreview("");
    setBannerPreview("");
    setShowAddModal(false);
  };

  const handleDeleteMovie = async (MovieId) => {
    try {
      await deleteMovie(MovieId);
      setMovie((prevMovie) =>
        prevMovie.filter((movie) => movie.movieId !== MovieId)
      );
      addToast("Khóa phim thành công!", "success");
      handleCloseModal();
    } catch (error) {
      addToast("Khóa phim thất bại", "error");
      handleCloseModal();
      console.error("Lỗi khi khóa phim:", error);
    }
  };

  const handleOpenConfirmModal = (movie, action) => {
    setSelectedMovieForAction(movie);
    setActionType(action);
    setConfirmModalOpen(true);
  };

  // Thêm hàm để toggle trạng thái xóa
  const handleToggleDeleteStatus = async (movie) => {
    if (!movie) {
      console.warn("Movie is null or undefined");
      return;
    }

    const newStatus = !movie.isDelete;

    try {
      const newStatus = !movie.isDelete;
      await toggleDeleteStatus(movie.movieId, newStatus);

      setMovie((prevMovies) =>
        prevMovies.map((m) =>
          m.movieId === movie.movieId ? { ...m, isDelete: newStatus } : m
        )
      );
      setConfirmModalOpen(false);
      setSelectedMovieForAction(null);
      addToast(newStatus ? "Đã khóa phim!" : "Đã khôi phục phim!", "success");
    } catch (error) {
      addToast(
        newStatus ? "Khóa phim thất bại!" : "Khôi phục phim thất bại!",
        "error"
      );
      setConfirmModalOpen(false);
      console.error("Lỗi khi cập nhật trạng thái phim:", error);
    }
  };

  const filteredMovie = movies.filter((movie) =>
    Object.values(movie).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentMovie = filteredMovie.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMovie.length / itemsPerPage);

  // Hàm tạo danh sách số trang hiển thị động
  const getPageNumbers = () => {
    const totalNumbers = 3; // Số lượng nút trang muốn hiển thị
    const half = Math.floor(totalNumbers / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, totalNumbers);
    } else if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - totalNumbers + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      const allMovieIds = filteredMovie.map((movie) => movie.movieId);
      setSelectedMovie(allMovieIds);
    } else {
      setSelectedMovie([]);
    }
  };

  const handleSelect = (movieId) => {
    setSelectedMovie((prevSelected) =>
      prevSelected.includes(movieId)
        ? prevSelected.filter((id) => id !== movieId)
        : [...prevSelected, movieId]
    );
  };
  const confirmBulkDelete = async () => {
    if (selectedMovie.length === 0) {
      addToast("Vui lòng chọn ít nhất một phim để khóa", "error");
      return;
    }

    try {
      // Create an array of promises for each movie update
      const updatePromises = selectedMovie.map((movieId) => {
        // Find the movie object
        const movieToUpdate = movies.find((movie) => movie.movieId === movieId);
        if (movieToUpdate) {
          // Toggle isDelete to true for each selected movie
          return toggleDeleteStatus(movieId, true);
        }
        return Promise.resolve(); // If movie not found, resolve empty promise
      });

      // Wait for all promises to complete
      await Promise.all(updatePromises);

      // Update local state to reflect changes
      setMovie((prevMovies) =>
        prevMovies.map((movie) =>
          selectedMovie.includes(movie.movieId)
            ? { ...movie, isDelete: true }
            : movie
        )
      );

      // Close modal and show success message
      setBulkDeleteModalOpen(false);
      setSelectedMovie([]); // Clear selection after delete
      addToast(`Đã khóa ${selectedMovie.length} phim thành công!`, "success");
    } catch (error) {
      console.error("Lỗi khi khóa nhiều phim:", error);
      setBulkDeleteModalOpen(false);
      addToast("Khóa phim thất bại!", error);
    }
  };
  // Add this function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedMovie.length === 0) {
      addToast("Vui lòng chọn ít nhất một phim để khóa", "error");
      return;
    }
    // Open a confirmation modal for bulk deletion
    setSelectedMovieIds(selectedMovie); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  const handleBulkRestore = () => {
    if (selectedMovie.length === 0) {
      addToast("Vui lòng chọn ít nhất một phim để khôi phục", "error");
      return;
    }
    // Open a confirmation modal for bulk deletion
    setSelectedMovieIds(selectedMovie); // Store all selected IDs
    setBulkRestoreModalOpen(true);
  };

  // Add a bulk restore function as well (optional)
  const confirmBulkRestore = () => {
    if (selectedMovie.length === 0) {
      addToast("Vui lòng chọn ít nhất một phim để khôi phục", "error");
      return;
    }

    // Similar to bulk delete but setting isDelete to false
    const updatePromises = selectedMovie.map((movieId) => {
      const movieToUpdate = movies.find((movie) => movie.movieId === movieId);
      if (movieToUpdate) {
        return toggleDeleteStatus(movieId, false);
      }
      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        setMovie((prevMovies) =>
          prevMovies.map((movie) =>
            selectedMovie.includes(movie.movieId)
              ? { ...movie, isDelete: false }
              : movie
          )
        );
        setBulkRestoreModalOpen(false);
        setSelectedMovie([]);
        addToast(
          `Đã khôi phục ${selectedMovie.length} phim thành công!`,
          "success"
        );
      })
      .catch((error) => {
        console.error("Lỗi khi khôi phục nhiều phim:", error);
        setBulkRestoreModalOpen(false);
        addToast("Khôi phục phim thất bại!", "error");
      });
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovie(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Movie");
        setLoading(false);
        console.error(err);
      }
    };

    fetchMovie();
  }, []);

  useEffect(() => {
    document.title = "Quản lý phim";
  }, []);

  // Add these functions to your existing MovieManagement component

  const handleEditMovie = (movie) => {
    // Set the form values with the movie data
    setValue("name", movie.name);
    setValue("director", movie.director);
    setValue("actor", movie.actor);
    setValue("description", movie.description);
    setValue("country", movie.country);
    setValue("duration", movie.duration);
    setValue("releaseDate", movie.releaseDate);
    setValue("ageLimit", movie.ageLimit);
    setValue("caption", movie.caption);
    setValue("posterUrl", movie.posterUrl);
    setValue("bannerUrl", movie.bannerUrl);
    setValue("trailerUrl", movie.trailerUrl);
    setValue("categoryId", movie.category.categoryId);

    // Set preview images and video
    setPosterPreview(movie.posterUrl);
    setBannerPreview(movie.bannerUrl);
    setVideoPreview(movie.trailerUrl);

    // Set the editing movie state
    setEditingMovie({
      movieId: movie.movieId,
      name: movie.name,
      director: movie.director,
      actor: movie.actor,
      description: movie.description,
      country: movie.country,
      duration: movie.duration,
      releaseDate: movie.releaseDate,
      ageLimit: movie.ageLimit,
      caption: movie.caption,
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      trailerUrl: movie.trailerUrl,
      categoryName: movie.category.name,
    });

    // Show the edit modal
    setShowEditModal(true);
    setSelectedMovieForAction(movie);
  };

  // Handle form submission for edit
  const handleEditSubmit = async (data) => {
    setUploading(true);

    const formattedData = {
      ...data,
      movieId: editingMovie.movieId,
      category: { categoryId: data.categoryId },
      isDelete: false,
    };

    try {
      const updatedMovie = await updateMovie(
        editingMovie.movieId,
        formattedData
      );

      // Update the movies list with the updated movie
      setMovie((prevMovies) =>
        prevMovies.map((movie) =>
          movie.movieId === editingMovie.movieId ? updatedMovie : movie
        )
      );
      addToast("Cập nhật phim thành công!", "success");

      // Close the modal and reset form
      setShowEditModal(false);
      reset();
      setPosterPreview("");
      setBannerPreview("");
      setVideoPreview("");
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);
      addToast("Cập nhật phim thất bại!", "error");
    } finally {
      setUploading(false);
    }
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setShowEditModal(false);
    reset();
    setPosterPreview("");
    setBannerPreview("");
    setVideoPreview("");
  };

  // Modify the existing function in your code to call handleEditMovie
  // Replace this:
  // const handleEditShowtime = (movie) => { ... }
  // With this:
  const handleEditShowtime = (movie) => {
    handleEditMovie(movie);
  };
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Left sidebar - similar to the image */}
      <ToastContainer />

      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              QUẢN LÝ PHIM
            </h1>
            <div className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
              <div className="relative w-full md:w-64 group">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim"
                  className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="material-icons absolute left-3 top-2.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                  search
                </span>
              </div>
              <UserInfo className="w-full md:w-auto" />
            </div>
          </div>
          {/*Add Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
            <button
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-icons mr-1">add</span>
              Thêm phim
            </button>
            <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2 sm:gap-0">
              <button
                className={`${
                  selectedMovie.length > 0
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                } 
                                        text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                                          selectedMovie.length > 0
                                            ? "hover:-translate-y-1"
                                            : ""
                                        }`}
                onClick={handleBulkDelete}
                disabled={selectedMovie.length === 0}
              >
                <span className="material-icons mr-1">delete</span>
                Khóa phim đã chọn ({selectedMovie.length})
              </button>

              {/* Optional: Add a bulk restore button */}
              <button
                className={`${
                  selectedMovie.length > 0
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400"
                } text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                  selectedMovie.length > 0 ? "hover:-translate-y-1" : ""
                }`}
                onClick={handleBulkRestore}
                disabled={selectedMovie.length === 0}
              >
                <span className="material-icons mr-1">restore_from_trash</span>
                Khôi phục phim đã chọn ({selectedMovie.length})
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
              <span className="material-icons text-4xl mb-2">error</span>
              <p className="text-lg">{error}</p>
            </div>
          ) : filteredMovie.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
              <span className="material-icons text-5xl text-gray-400 mb-3">
                movie
              </span>
              <h3 className="text-xl font-medium text-gray-700 mb-1">
                Không tìm thấy phim
              </h3>
              <p className="text-gray-500">
                Không có phim nào phù hợp với tiêu chí tìm kiếm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left w-10">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                        checked={
                          selectAll ||
                          (currentMovie.length > 0 &&
                            currentMovie.every((movie) =>
                              selectedMovie.includes(movie.movieId)
                            ))
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Tên phim
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Đạo diễn
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Thời lượng
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Ngày phát hành
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Giới hạn tuổi
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Caption
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentMovie.map((movie) => (
                    <tr
                      key={movie.movieId}
                      className={`border-b hover:bg-gray-50 transition-all duration-300 ${
                        movie.isDelete ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                          checked={selectedMovie.includes(movie.movieId)}
                          onChange={() => handleSelect(movie.movieId)}
                        />
                      </td>
                      <td className="p-3 font-medium text-center text-gray-900">
                        {movie.movieId}
                      </td>
                      <td
                        className={`p-3 font-medium text-left text-gray-900 ${
                          movie.isDelete ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        <div className="flex items-center">
                          {movie.isDelete && (
                            <span className="mr-2 text-red-500 flex items-center">
                              <span className="material-icons text-sm">
                                lock
                              </span>
                            </span>
                          )}
                          <span
                            className={movie.isDelete ? "line-through" : ""}
                          >
                            {movie.name}
                          </span>
                          {movie.isDelete && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <span className="material-icons text-xs mr-1">
                                block
                              </span>
                              Đã khóa
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className={`p-3 text-center hidden sm:table-cell ${
                          movie.isDelete ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {movie.director}
                      </td>
                      <td
                        className={`p-3 text-center hidden sm:table-cell ${
                          movie.isDelete ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {movie.duration}
                      </td>
                      <td
                        className={`p-3 text-center hidden sm:table-cell ${
                          movie.isDelete ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {movie.releaseDate}
                      </td>
                      <td
                        className={`p-3 text-center hidden sm:table-cell ${
                          movie.isDelete ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {movie.ageLimit}
                      </td>
                      <td
                        className={`p-3 text-center hidden sm:table-cell ${
                          movie.isDelete ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {movie.caption}
                      </td>
                      <td className="p-3 text-center text-gray-600 hidden sm:table-cell">
                        <div className="flex justify-center space-x-1">
                          <button
                              onClick={() => handleEditShowtime(movie)}
                              className={`text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
                                  movie.isDelete ? "opacity-75" : ""
                              }`}
                              title={movie.isDelete ? "Chỉnh sửa phim đã khóa" : "Chỉnh sửa"}
                          >
                            <span className="material-icons">edit</span>
                          </button>


                          {!movie.isDelete ? (
                              <button
                                  onClick={() =>
                                      handleOpenConfirmModal(movie, "delete")
                                  }
                                  className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                                  title="Khóa phim"
                              >
                                <span className="material-icons">lock</span>
                              </button>
                          ) : (
                              <button
                                  onClick={() =>
                                      handleOpenConfirmModal(movie, "restore")
                                  }
                                  className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-2 rounded-full transition-colors animate-pulse"
                                  title="Khôi phục phim"
                              >
                              <span className="material-icons">
                                lock_open
                              </span>
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Modal Xác Nhận Kh/Khôi phục */}
          {isConfirmModalOpen && selectedMovieForAction && (
              <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                <div
                ref={modalConfirmRef}
                className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
              >
                <h2 className="text-lg font-semibold mb-4">
                  {actionType === "delete" ? "Xác nhận " : "Xác nhận khôi phục"}
                </h2>
                <p className="mb-6">
                  {actionType === "delete"
                    ? `Bạn có chắc chắn muốn khóa phim "${selectedMovieForAction.movieId}" không?`
                    : `Bạn có chắc chắn muốn khôi phục phim "${selectedMovieForAction.movieId}" không?`}
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setConfirmModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() =>
                      handleToggleDeleteStatus(selectedMovieForAction)
                    }
                    className={`px-4 py-2 rounded-md text-white ${
                      actionType === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {actionType === "delete" ? "Khóa" : "Khôi phục"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddModal && (
              <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                <div
                    ref={modalAddRef}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold mb-4">
                        Thêm phim mới
                      </h2>
                      <button
                          onClick={() => setShowAddModal(false)}
                          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                      >
                        <span className="material-icons">close</span>
                      </button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {/* Tên phim */}
                      <div className="mb-3">
                        <label className="block mb-2">Tên phim <span className="text-red-500">*</span></label>
                        <input
                            {...register("name", {
                              required: "Tên phim là bắt buộc"
                            })}
                            type="text"
                            placeholder="Tên phim"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.name
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Đạo diễn */}
                      <div className="mb-3">
                        <label className="block mb-2">Đạo diễn <span className="text-red-500">*</span></label>
                        <input
                            {...register("director", {
                              required: "Đạo diễn là bắt buộc"
                            })}
                            type="text"
                            placeholder="Đạo diễn"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.director
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.director && (
                            <p className="text-red-500 text-sm mt-1">{errors.director.message}</p>
                        )}
                      </div>

                      {/* Diễn viên */}
                      <div className="mb-3">
                        <label className="block mb-2">Diễn viên <span className="text-red-500">*</span></label>
                        <input
                            {...register("actor", {
                              required: "Diễn viên là bắt buộc"
                            })}
                            type="text"
                            placeholder="Diễn viên"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.actor
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.actor && (
                            <p className="text-red-500 text-sm mt-1">{errors.actor.message}</p>
                        )}
                      </div>

                      {/* Mô tả phim */}
                      <div className="mb-3">
                        <label className="block mb-2">Mô tả phim <span className="text-red-500">*</span></label>
                        <textarea
                            {...register("description", {
                              required: "Mô tả phim là bắt buộc"
                            })}
                            placeholder="Mô tả phim"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.description
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        ></textarea>
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                        )}
                      </div>

                      {/* Quốc gia */}
                      <div className="mb-3">
                        <label className="block mb-2">Quốc gia <span className="text-red-500">*</span></label>
                        <input
                            {...register("country", {
                              required: "Quốc gia là bắt buộc"
                            })}
                            type="text"
                            placeholder="Quốc gia"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.country
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.country && (
                            <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
                        )}
                      </div>

                      {/* Thời lượng */}
                      <div className="mb-3">
                        <label className="block mb-2">Thời lượng (phút) <span className="text-red-500">*</span></label>
                        <input
                            {...register("duration", {
                              required: "Thời lượng là bắt buộc",
                              min: { value: 1, message: "Thời lượng phải lớn hơn 0" }
                            })}
                            type="number"
                            placeholder="Thời lượng (phút)"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.duration
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.duration && (
                            <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                        )}
                      </div>

                      {/* Ngày phát hành */}
                      <div className="mb-3">
                        <label className="block mb-2">Ngày phát hành <span className="text-red-500">*</span></label>
                        <input
                            {...register("releaseDate", {
                              required: "Ngày phát hành là bắt buộc"
                            })}
                            type="date"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.releaseDate
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.releaseDate && (
                            <p className="text-red-500 text-sm mt-1">{errors.releaseDate.message}</p>
                        )}
                      </div>

                      {/* Giới hạn tuổi */}
                      <div className="mb-3">
                        <label className="block mb-2">Giới hạn tuổi <span className="text-red-500">*</span></label>
                        <input
                            {...register("ageLimit", {
                              required: "Giới hạn tuổi là bắt buộc",
                              min: { value: 0, message: "Giới hạn tuổi không được âm" }
                            })}
                            type="number"
                            placeholder="Giới hạn tuổi"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.ageLimit
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.ageLimit && (
                            <p className="text-red-500 text-sm mt-1">{errors.ageLimit.message}</p>
                        )}
                      </div>

                      {/* Caption */}
                      <div className="mb-3">
                        <label className="block mb-2">Caption <span className="text-red-500">*</span></label>
                        <input
                            {...register("caption", {
                              required: "Caption là bắt buộc"
                            })}
                            placeholder="Caption"
                            type="text"
                            className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.caption
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                        />
                        {errors.caption && (
                            <p className="text-red-500 text-sm mt-1">{errors.caption.message}</p>
                        )}
                      </div>

                      {/* Poster */}
                      <div className="mb-3">
                        <label className="block mb-2">Poster: <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadImage(e.target.files[0], "posterUrl")}
                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                        />
                      </div>

                      {posterPreview && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                            <img
                                src={posterPreview}
                                alt="Poster Preview"
                                className="max-h-48 rounded border"
                            />
                          </div>
                      )}

                      {/* Banner */}
                      <div className="mb-3">
                        <label className="block mb-2">Banner: <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => uploadImage(e.target.files[0], "bannerUrl")}
                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                        />
                      </div>

                      {bannerPreview && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                            <img
                                src={bannerPreview}
                                alt="Banner Preview"
                                className="w-full max-h-32 object-cover rounded border"
                            />
                          </div>
                      )}

                      {/* Trailer */}
                      <div className="mb-3">
                        <label className="block mb-2">Trailer: <span className="text-red-500">*</span></label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => uploadVideo(e.target.files[0])}
                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                        />
                      </div>

                      {videoPreview && (
                          <div className="mb-3">
                            <video className="w-full mt-2" controls>
                              <source src={videoPreview} type="video/mp4" />
                              Trình duyệt của bạn không hỗ trợ video.
                            </video>
                          </div>
                      )}

                      {/* Thể loại */}
                      <div className="mb-3">
                        <label className="block mb-2">Thể loại: <span className="text-red-500">*</span></label>
                        <select
                            {...register("categoryId", {
                              required: "Thể loại là bắt buộc"
                            })}
                            className={`appearance-none w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                errors.categoryId
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                            }`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0.75rem center',
                              backgroundSize: '1.25em'
                            }}
                        >
                          <option value="">Chọn thể loại</option>
                          {categories.map((category) => (
                              <option
                                  key={category.categoryId}
                                  value={category.categoryId}
                              >
                                {category.name}
                              </option>
                          ))}
                        </select>
                        {errors.categoryId && (
                            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
                        )}
                      </div>

                      <div className="flex justify-end mt-6 gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          {uploading ? "Đang tải..." : "Thêm phim"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
          )}


          {/* Edit Modal - Add this to your component's return statement */}
          {showEditModal && selectedMovieForAction && (
              <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                <div
                    ref={modalEditRef}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold mb-4">
                      Chỉnh sửa Phim #{selectedMovieForAction.movieId}
                    </h2>
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>

                  <form
                    onSubmit={handleSubmit(handleEditSubmit)}
                    className="space-y-4"
                  >
                    <div className="mb-3">
                      <label className="block mb-2">Tên phim</label>
                      <input
                        {...register("name", { required: true })}
                        type="text"
                        placeholder="Tên phim"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Đạo diễn</label>
                      <input
                        {...register("director")}
                        type="text"
                        placeholder="Đạo diễn"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Diễn viên</label>
                      <input
                        {...register("actor")}
                        type="text"
                        placeholder="Diễn viên"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Mô tả phim</label>
                      <textarea
                        {...register("description")}
                        placeholder="Mô tả phim"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Quốc gia</label>
                      <input
                        {...register("country")}
                        type="text"
                        placeholder="Quốc gia"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Thời lượng (phút)</label>
                      <input
                        {...register("duration", { required: true })}
                        type="number"
                        placeholder="Thời lượng (phút)"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Ngày phát hành</label>
                      <input
                        {...register("releaseDate")}
                        type="date"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Giới hạn tuổi</label>
                      <input
                        {...register("ageLimit")}
                        type="number"
                        placeholder="Giới hạn tuổi"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Caption</label>
                      <input
                        {...register("caption")}
                        placeholder="Caption"
                        type="text"
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block mb-2">Poster:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          uploadImage(e.target.files[0], "posterUrl")
                        }
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    {posterPreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                        <img
                          src={posterPreview}
                          alt="Poster Preview"
                          className="max-h-48 rounded border"
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="block mb-2">Banner:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          uploadImage(e.target.files[0], "bannerUrl")
                        }
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    {bannerPreview && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Xem trước:</p>
                        <img
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="w-full max-h-32 object-cover rounded border"
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="block mb-2">Trailer:</label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => uploadVideo(e.target.files[0])}
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      />
                    </div>

                    {videoPreview && (
                      <div className="mb-3">
                        <video className="w-full mt-2" controls>
                          <source src={videoPreview} type="video/mp4" />
                          Trình duyệt của bạn không hỗ trợ video.
                        </video>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="block mb-2">Thể loại:</label>
                      <select
                        {...register("categoryId", { required: true })}
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm"
                      >
                        <option value="">Chọn thể loại</option>
                        {categories.map((category) => (
                          <option
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end mt-6 gap-3">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {uploading ? "Đang tải..." : "Cập Nhật Phim"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteModalOpen && (
            <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
              <div
                ref={modalbulkDeRef}
                className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Xác nhận Khóa hàng loạt
                </h2>
                <p className="mb-6 text-gray-600">
                  Bạn có chắc chắn muốn khóa {selectedMovie.length} phim đã chọn
                  không?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setBulkDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  >
                    Khóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {bulkRestoreModalOpen && (
            <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
              <div
                ref={modalbulkReRef}
                className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Xác nhận khôi phục hàng loạt
                </h2>
                <p className="mb-6 text-gray-600">
                  Bạn có chắc chắn muốn khôi phục {selectedMovie.length} phim đã
                  chọn không?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setBulkRestoreModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmBulkRestore}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    Khôi phục
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination.jsx */}
          <div className="flex flex-wrap justify-center mt-8 gap-2">
            <div className="flex flex-wrap justify-center items-center gap-2">
              {/* Nút về trang đầu tiên */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
                title="Trang đầu"
              >
                &laquo;
              </button>

              {/* Nút trang trước */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                &lt;
              </button>

              {/* Hiển thị nút trang đầu tiên khi không nằm trong danh sách trang hiện tại */}
              {getPageNumbers()[0] > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    1
                  </button>
                  {getPageNumbers()[0] > 2 && (
                    <span className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">
                      ...
                    </span>
                  )}
                </>
              )}

              {/* Các nút trang ở giữa */}
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`mx-1 px-3 py-1.5 rounded-md transition-all duration-200 ease-in-out ${
                    currentPage === pageNumber
                      ? "bg-gray-900 text-white shadow-md transform scale-105"
                      : "border border-gray-300 hover:bg-gray-100"
                  } text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-400`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Hiển thị nút trang cuối cùng khi không nằm trong danh sách trang hiện tại */}
              {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                <>
                  {getPageNumbers()[getPageNumbers().length - 1] <
                    totalPages - 1 && (
                    <span className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              {/* Nút trang tiếp theo */}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                &gt;
              </button>

              {/* Nút tới trang cuối cùng */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="mx-1 px-3 py-1.5 rounded-md border border-gray-300 disabled:opacity-40 text-sm md:text-base hover:bg-gray-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
                title="Trang cuối"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
