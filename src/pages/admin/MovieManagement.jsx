import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import {
  deleteMovie,
  getMovies,
  addMovie,
  getCategories,
  updateMovie,
  toggleDeleteStatus,
} from "@/services/api.jsx";
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

  const { register, handleSubmit, reset, setValue } = useForm();
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

  const ToastNotification = ({ message, type, movie }) => {
    if (!movie) return null;

    const typeStyles = {
      success: "bg-green-500",
      error: "bg-red-500",
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
        style={{
          animation: "fadeInOut 3s ease-in-out",
          opacity: movie ? 1 : 0,
        }}
      >
        {message}
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
    const formattedData = {
      ...data,
      category: { categoryId: data.categoryId },
    };

    try {
      const newMovie = await addMovie(formattedData);
      setMovie((prevMovies) => [...prevMovies, newMovie]);
      console.log("Dữ liệu phim gửi đi:", formattedData);
      setMessage("Thêm phim thành công!");
      // reset();
      // setVideoPreview("");
      setShowAddModal(false);

      setToast({
        movie: true,
        message: "Thêm phim thành công!",
        type: "success",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        movie: true,
        message: "Thêm phòng thất bại!",
        type: "error",
      });

      console.error(error);

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
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
      setToast({
        movie: true,
        message: "Xóa phim thành công!",
        type: "success",
      });
      handleCloseModal();
      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        movie: true,
        message: "Xóa phim thất bại",
        type: "error",
      });
      handleCloseModal();
      console.error("Lỗi khi xóa phim:", error);
      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    }
  };

  const handleOpenConfirmModal = (movie, action) => {
    setSelectedMovieForAction(movie);
    setActionType(action);
    setConfirmModalOpen(true);
  };

  // const handleConfirmAction = () => {
  //     if (selectedMovieForAction) {
  //         handleToggleDeleteStatus(selectedMovieForAction);
  //     }
  //     setConfirmModalOpen(false);
  //     setSelectedMovieForAction(null);
  // };

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
      setToast({
        movie: true,
        message: newStatus ? "Đã xóa phim!" : "Đã khôi phục phim!",
        type: "success",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        movie: true,
        message: newStatus ? "Xóa phim thất bại!" : "Khôi phục phim thất bại!",
        type: "error",
      });
      setConfirmModalOpen(false);
      console.error("Lỗi khi cập nhật trạng thái phim:", error);

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    }
  };

  const [toast, setToast] = useState({
    movie: false,
    message: "",
    type: "success",
  });

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
    const totalNumbers = 5; // Số lượng nút trang muốn hiển thị
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
      setToast({
        movie: true,
        message: "Vui lòng chọn ít nhất một phim để xóa",
        type: "error",
      });
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

      setToast({
        movie: true,
        message: `Đã xóa ${selectedMovie.length} phim thành công!`,
        type: "success",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Lỗi khi xóa nhiều phim:", error);

      setBulkDeleteModalOpen(false);
      setToast({
        movie: true,
        message: "Xóa phim thất bại!",
        type: "error",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
    }
  };
  // Add this function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedMovie.length === 0) {
      setToast({
        movie: true,
        message: "Vui lòng chọn ít nhất một phim để xóa",
        type: "error",
      });
      return;
    }

    // Open a confirmation modal for bulk deletion
    setSelectedMovieIds(selectedMovie); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  const handleBulkRestore = () => {
    if (selectedMovie.length === 0) {
      setToast({
        movie: true,
        message: "Vui lòng chọn ít nhất một phim để khôi phục",
        type: "error",
      });
      return;
    }

    // Open a confirmation modal for bulk deletion
    setSelectedMovieIds(selectedMovie); // Store all selected IDs
    setBulkRestoreModalOpen(true);
  };

  // Add a bulk restore function as well (optional)
  const confirmBulkRestore = () => {
    if (selectedMovie.length === 0) {
      setToast({
        movie: true,
        message: "Vui lòng chọn ít nhất một phim để khôi phục",
        type: "error",
      });
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

        setToast({
          movie: true,
          message: `Đã khôi phục ${selectedMovie.length} phim thành công!`,
          type: "success",
        });

        setTimeout(() => {
          setToast({ movie: false, message: "", type: "success" });
        }, 3000);
      })
      .catch((error) => {
        console.error("Lỗi khi khôi phục nhiều phim:", error);
        setBulkRestoreModalOpen(false);
        setToast({
          movie: true,
          message: "Khôi phục phim thất bại!",
          type: "error",
        });

        setTimeout(() => {
          setToast({ movie: false, message: "", type: "success" });
        }, 3000);
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

      setToast({
        movie: true,
        message: "Cập nhật phim thành công!",
        type: "success",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);

      // Close the modal and reset form
      setShowEditModal(false);
      reset();
      setPosterPreview("");
      setBannerPreview("");
      setVideoPreview("");
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);

      setToast({
        movie: true,
        message: "Cập nhật phim thất bại!",
        type: "error",
      });

      setTimeout(() => {
        setToast({ movie: false, message: "", type: "success" });
      }, 3000);
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
    <div className="flex flex-col h-screen">
      {/* Left sidebar - similar to the image */}

      <ToastNotification
        message={toast.message}
        type={toast.type}
        movie={toast.movie}
      />

      <div className="flex h-full">
        <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
          <h1 className="text-2xl font-bold mb-4 ">
            <Link to="/">Cinema Booking</Link>
          </h1>

          <nav className="space-y-4 flex-grow">
            <Link
              to="/admin/roommanagement"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">meeting_room</span>
              <span>Phòng chiếu</span>
            </Link>
            <Link
              to="/admin/showtimemanagement"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">calendar_month</span>
              <span>Lịch chiếu</span>
            </Link>
            <Link
              to="/admin/moviemanagement"
              className="flex items-center gap-2 py-2 px-3 bg-gray-800 rounded"
            >
              <span className="material-icons">movie</span>
              <span>Phim</span>
            </Link>
            <Link
              to="/admin/accountmanagement"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">account_circle</span>
              <span>Tài khoản</span>
            </Link>
            <Link
              to="/admin/seatmanagement"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">event_seat</span>
              <span>Ghế ngồi</span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">confirmation_number</span>
              <span>Quản lý vé đặt</span>
            </Link>
            <Link
              to="#"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">assessment</span>
              <span>Báo cáo</span>
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">QUẢN LÝ PHIM</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm phim"
                  className="border rounded-md py-2 px-4 pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="material-icons absolute left-3 top-2 text-gray-400">
                  search
                </span>
              </div>
              <div className="flex items-center">
                <div className="ml-4 flex items-center">
                  <span className="font-medium mr-2">ADMIN</span>
                  <span className="material-icons">person</span>
                </div>
              </div>
            </div>
          </div>
          {/*Add Button */}
          <div className="flex justify-between mb-6">
            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => setShowAddModal(true)}
            >
              <span className="material-icons mr-1">add</span>
              Thêm phim
            </button>
            <div className="flex space-x-2">
              <button
                className={`${
                  selectedMovie.length > 0 ? "bg-red-600" : "bg-gray-400"
                } text-white px-4 py-2 rounded-md flex items-center`}
                onClick={handleBulkDelete}
                disabled={selectedMovie.length === 0}
              >
                <span className="material-icons mr-1">delete</span>
                Xóa phim đã chọn ({selectedMovie.length})
              </button>

              {/* Optional: Add a bulk restore button */}
              <button
                className={`${
                  selectedMovie.length > 0 ? "bg-green-600" : "bg-gray-400"
                } text-white px-4 py-2 rounded-md flex items-center`}
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
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left w-12">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5"
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
                    <th className="p-3 text-center">Tên phim</th>
                    <th className="p-3 text-center">Đạo diễn</th>
                    <th className="p-3 text-center">Thời lượng</th>
                    <th className="p-3 text-center">Ngày phát hành</th>
                    <th className="p-3 text-center">Giới hạn tuổi</th>
                    <th className="p-3 text-center">Caption</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMovie.map((movie) => (
                    <tr
                      key={movie.movieId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={selectedMovie.includes(movie.movieId)}
                          onChange={() => handleSelect(movie.movieId)}
                        />
                      </td>
                      <td className="p-3 font-medium text-center">
                        {movie.name}
                        {movie.isDelete && (
                          <span className="ml-2 text-xs text-red-500">
                            (đã xóa)
                          </span>
                        )}
                      </td>
                      {/*<td className="p-3 font-medium">{movie.name}</td>*/}
                      <td className="p-3 text-center">{movie.director}</td>
                      <td className="p-3 text-center">{movie.duration}</td>
                      <td className="p-3 text-center">{movie.releaseDate}</td>
                      <td className="p-3 text-center">{movie.ageLimit}</td>
                      <td className="p-3 text-center">{movie.caption}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleEditShowtime(movie)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        {/*<button*/}
                        {/*   onClick={() => handleOpenDeleteModal(movie.movieId)}*/}
                        {/*    onClick={() => handleOpenConfirmModal(movie, 'delete')}*/}
                        {/*    className="text-gray-600 hover:text-gray-800"*/}
                        {/*>*/}
                        {/*    <span className="material-icons">delete</span>*/}
                        {/*</button>*/}

                        {!movie.isDelete ? (
                          <button
                            onClick={() =>
                              handleOpenConfirmModal(movie, "delete")
                            }
                            className="text-gray-600 hover:text-red-600"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleOpenConfirmModal(movie, "restore")
                            }
                            className="text-gray-600 hover:text-green-600"
                          >
                            <span className="material-icons">
                              restore_from_trash
                            </span>
                          </button>
                        )}

                        {/* Modal Xác Nhận Xóa/Khôi phục */}
                        {isConfirmModalOpen && (
                          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                              <h2 className="text-lg font-semibold mb-4">
                                {actionType === "delete"
                                  ? "Xác nhận xóa"
                                  : "Xác nhận khôi phục"}
                              </h2>
                              <p className="mb-6">
                                {actionType === "delete"
                                  ? "Bạn có chắc chắn muốn xóa phim này không?"
                                  : "Bạn có chắc chắn muốn khôi phục phim này không?"}
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
                                    handleToggleDeleteStatus(movie)
                                  }
                                  className={`px-4 py-2 rounded-md text-white ${
                                    actionType === "delete"
                                      ? "bg-red-600 hover:bg-red-700"
                                      : "bg-green-600 hover:bg-green-700"
                                  }`}
                                >
                                  {actionType === "delete"
                                    ? "Xóa"
                                    : "Khôi phục"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Thêm Phim Mới</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="mb-3">
                    <label className="block mb-2">Tên phim</label>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      placeholder="Tên phim"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Đạo diễn</label>
                    <input
                      {...register("director")}
                      type="text"
                      placeholder="Đạo diễn"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Diễn viên</label>
                    <input
                      {...register("actor")}
                      type="text"
                      placeholder="Diễn viên"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Mô tả phim</label>
                    <textarea
                      {...register("description")}
                      placeholder="Mô tả phim"
                      className="w-full p-2 border rounded"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Quốc gia</label>
                    <input
                      {...register("country")}
                      type="text"
                      placeholder="Quốc gia"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Thời lượng (phút)</label>
                    <input
                      {...register("duration", { required: true })}
                      type="number"
                      placeholder="Thời lượng (phút)"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Ngày phát hành</label>
                    <input
                      {...register("releaseDate")}
                      type="date"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Giới hạn tuổi</label>
                    <input
                      {...register("ageLimit")}
                      type="number"
                      placeholder="Giới hạn tuổi"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Caption</label>
                    <input
                      {...register("caption")}
                      placeholder="Caption"
                      type="text"
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      {uploading ? "Đang tải..." : "Thêm Phim"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal - Add this to your component's return statement */}
          {showEditModal && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa Phim</h2>

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
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Đạo diễn</label>
                    <input
                      {...register("director")}
                      type="text"
                      placeholder="Đạo diễn"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Diễn viên</label>
                    <input
                      {...register("actor")}
                      type="text"
                      placeholder="Diễn viên"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Mô tả phim</label>
                    <textarea
                      {...register("description")}
                      placeholder="Mô tả phim"
                      className="w-full p-2 border rounded"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Quốc gia</label>
                    <input
                      {...register("country")}
                      type="text"
                      placeholder="Quốc gia"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Thời lượng (phút)</label>
                    <input
                      {...register("duration", { required: true })}
                      type="number"
                      placeholder="Thời lượng (phút)"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Ngày phát hành</label>
                    <input
                      {...register("releaseDate")}
                      type="date"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Giới hạn tuổi</label>
                    <input
                      {...register("ageLimit")}
                      type="number"
                      placeholder="Giới hạn tuổi"
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block mb-2">Caption</label>
                    <input
                      {...register("caption")}
                      placeholder="Caption"
                      type="text"
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="w-full p-2 border rounded"
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
                      className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    >
                      {uploading ? "Đang tải..." : "Cập Nhật Phim"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">
                  Xác nhận xóa hàng loạt
                </h2>
                <p className="mb-6">
                  Bạn có chắc chắn muốn xóa {selectedMovie.length} phim đã chọn
                  không?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setBulkDeleteModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmBulkDelete}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {bulkRestoreModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">
                  Xác nhận khôi phục hàng loạt
                </h2>
                <p className="mb-6">
                  Bạn có chắc chắn muốn khôi phục {selectedMovie.length} phim đã
                  chọn không?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setBulkRestoreModalOpen(false)}
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmBulkRestore}
                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-red-700"
                  >
                    Khôi phục
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <div className="flex">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
              >
                &lt;
              </button>

              {currentPage > 3 && totalPages > 5 && (
                <span className="mx-1 px-3 py-1">...</span>
              )}

              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-gray-900 text-white"
                      : "border"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {currentPage < totalPages - 2 && totalPages > 5 && (
                <span className="mx-1 px-3 py-1">...</span>
              )}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
