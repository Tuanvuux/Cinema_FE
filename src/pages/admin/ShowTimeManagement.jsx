import React, { useState, useEffect } from "react";
import {
  getShowtime,
  deleteShowtime,
  getMovies,
  getRooms,
  addShowtime,
  updateShowtime,
} from "../../services/api.jsx";
import { Link } from "react-router-dom";
import { format, addMinutes, isSameDay, isSameMinute } from "date-fns";

export default function ShowtimeManagement() {
  const [Showtime, setShowtime] = useState([]);

  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showDate, setShowDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedShowtime, setSelectedShowtime] = useState([]);

  const [editingShowtime, setEditingShowtime] = useState({
    showtimeId: "",
    nameMovie: "",
    showDate: "",
    startTime: "",
    endTime: "",
    nameRoom: "",
  });
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

  const [showEditModal, setshowEditModal] = useState(false);
  const [showAddModal, setshowAddModal] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedShowtimeIds, setSelectedShowtimeIds] = useState([]);

  useEffect(() => {
    document.title = "Quản lý lịch chiếu";
  }, []);

  useEffect(() => {
    getMovies().then(setMovies);
    getRooms().then(setRooms);
    getShowtime().then(setShowtime);
  }, []);

  const handleEditShowtime = (showtime) => {
    setEditingShowtime({
      showtimeId: showtime.showtimeId,
      movieId: showtime.movie.movieId,
      showDate: showtime.showDate,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      roomId: showtime.room.id,
    });
    setSelectedShowtimeId(showtime.showtimeId);
    setshowEditModal(true);

    // Also update the selected values for the dropdowns
    setSelectedMovie(showtime.movie.movieId);
    setSelectedRoom(showtime.room.id);
    setShowDate(showtime.showDate);
    setStartTime(showtime.startTime);
    setEndTime(showtime.endTime);
  };
  // Cập nhật hàm handleInputChangeEdit để xử lý cả trường hợp movieId là số
  const handleInputChangeEdit = (e) => {
    const value =
      e.target.name === "movieId" ? parseInt(e.target.value) : e.target.value;
    setEditingShowtime({ ...editingShowtime, [e.target.name]: value });

    // Nếu đang thay đổi movieId
    if (e.target.name === "movieId") {
      const movieId = parseInt(e.target.value);

      // Tính lại giờ kết thúc khi chọn phim mới
      if (editingShowtime.startTime && movieId) {
        const movie = movies.find((m) => m.movieId === movieId);
        if (movie) {
          const startDate = new Date(`2023-01-01T${editingShowtime.startTime}`);
          const endDate = addMinutes(startDate, movie.duration);
          setEditingShowtime((prev) => ({
            ...prev,
            movieId: movieId,
            endTime: format(endDate, "HH:mm:ss"),
          }));
        }
      }
    }
  };

  // const handleStartTimeChange = (e) => {
  //     setStartTime(e.target.value);
  //     if (selectedMovie) {
  //         const movieDuration = movies.find(m => m.movieId === selectedMovie)?.duration;
  //         setEndTime(format(addMinutes(new Date(`2023-01-01T${e.target.value}`), movieDuration), 'HH:mm:ss'));
  //     }
  // };

  const handleStartTimeChange = (e) => {
    const timeValue = e.target.value;
    setStartTime(timeValue + ":00"); // Thêm giây để phù hợp với định dạng "HH:mm:ss"

    if (selectedMovie) {
      // Tìm thông tin phim để lấy duration
      const movie = movies.find((m) => m.movieId === selectedMovie);
      if (movie) {
        const duration = movie.duration;

        // Tính thời gian kết thúc bằng cách cộng thời lượng phim vào thời gian bắt đầu
        const startDate = new Date(`2023-01-01T${timeValue}:00`);
        const endDate = addMinutes(startDate, duration);
        const formattedEndTime = format(endDate, "HH:mm:ss");

        setEndTime(formattedEndTime);
      }
    }
  };

  // const handleSubmit = async () => {
  //     try {
  //         await addShowtime({
  //             movie: { movieId: selectedMovie },
  //             showDate,
  //             startTime,
  //             endTime,
  //             room: { id: selectedRoom },
  //         });
  //         setshowAddModal(false);
  //     } catch (error) {
  //         console.error("Error adding showtime:", error);
  //         alert("Có lỗi xảy ra khi thêm lịch chiếu");
  //     }
  // };

  const handleSubmit = async () => {
    try {
      const formattedStartTime = startTime.includes(":")
        ? startTime.includes(".")
          ? startTime
          : startTime.split(":").length === 2
          ? startTime + ":00"
          : startTime
        : startTime + ":00:00";

      const formattedEndTime = endTime.includes(":")
        ? endTime.includes(".")
          ? endTime
          : endTime.split(":").length === 2
          ? endTime + ":00"
          : endTime
        : endTime + ":00:00";

      const response = await addShowtime({
        movie: { movieId: selectedMovie },
        showDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        room: { id: selectedRoom },
      });

      console.log("Kết quả:", response);

      setshowAddModal(false);

      await getShowtime().then((data) => {
        setShowtime(data);
        setToast({
          show: true,
          message: "Thêm lịch chiếu thành công!",
          type: "success",
        });

        setTimeout(() => {
          setToast({ show: false, message: "", type: "success" });
        }, 3000);
      });
    } catch (error) {
      console.error("Chi tiết lỗi:", error.response?.data || error.message);
      alert("Có lỗi xảy ra khi thêm lịch chiếu");
    }
  };

  // const isRoomDisabled = (roomId) => {
  //     return Showtime.some(showtime =>
  //         showtime.room.id === roomId &&
  //         showtime.showDate === showDate &&
  //         isSameMinute(new Date(`2023-01-01T${showtime.startTime}`), new Date(`2023-01-01T${startTime}`))
  //     );
  // };

  const isRoomDisabled = (roomId) => {
    // Nếu không có ngày hoặc giờ bắt đầu hoặc giờ kết thúc được chọn, trả về false
    if (!showDate || !startTime || !endTime) {
      return false;
    }

    return Showtime.some((showtime) => {
      // Chỉ xét các lịch chiếu trong cùng một ngày và cùng phòng
      if (showtime.room.id !== roomId || showtime.showDate !== showDate) {
        return false;
      }

      // Chuyển đổi thời gian thành đối tượng Date để dễ so sánh
      const newStartTime = new Date(`2023-01-01T${startTime}`);
      const newEndTime = new Date(`2023-01-01T${endTime}`);
      const existingStartTime = new Date(`2023-01-01T${showtime.startTime}`);
      const existingEndTime = new Date(`2023-01-01T${showtime.endTime}`);

      // Kiểm tra xung đột thời gian
      // Hai lịch chiếu xung đột khi:
      // - lịch mới bắt đầu trước khi lịch cũ kết thúc VÀ
      // - lịch mới kết thúc sau khi lịch cũ bắt đầu
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });
  };

  const isRoomDisabledEdit = (roomId) => {
    // Nếu đây là phòng hiện tại của lịch chiếu đang chỉnh sửa, luôn cho phép chọn
    if (roomId === editingShowtime.roomId) {
      return false;
    }

    // Nếu không có đủ thông tin để kiểm tra, trả về false
    if (
      !editingShowtime.showDate ||
      !editingShowtime.startTime ||
      !editingShowtime.endTime
    ) {
      return false;
    }

    return Showtime.some((showtime) => {
      // Bỏ qua chính lịch chiếu đang được chỉnh sửa
      if (showtime.id === editingShowtime.showtimeId) {
        return false;
      }

      // Chỉ xét các lịch chiếu trong cùng ngày và cùng phòng mới
      if (
        showtime.room.id !== roomId ||
        showtime.showDate !== editingShowtime.showDate
      ) {
        return false;
      }

      // Chuyển đổi thời gian thành đối tượng Date để dễ so sánh
      const newStartTime = new Date(`2023-01-01T${editingShowtime.startTime}`);
      const newEndTime = new Date(`2023-01-01T${editingShowtime.endTime}`);
      const existingStartTime = new Date(`2023-01-01T${showtime.startTime}`);
      const existingEndTime = new Date(`2023-01-01T${showtime.endTime}`);

      // Kiểm tra xung đột thời gian
      return newStartTime < existingEndTime && newEndTime > existingStartTime;
    });
  };

  // const isRoomDisabledEdit = (roomId) => {
  //     return Showtime.some(showtime =>
  //         showtime.room.id === roomId &&
  //         showtime.showDate === editingShowtime.showDate &&
  //         showtime.id !== editingShowtime.showtimeId &&
  //         isSameMinute(new Date(`2023-01-01T${showtime.startTime}`), new Date(`2023-01-01T${editingShowtime.startTime}`))
  //     );
  // };

  const handleEditSubmit = async () => {
    try {
      const formattedStartTime = editingShowtime.startTime.includes(":")
        ? editingShowtime.startTime.includes(".")
          ? startTime
          : editingShowtime.startTime.split(":").length === 2
          ? editingShowtime.startTime + ":00"
          : editingShowtime.startTime
        : editingShowtime.startTime + ":00:00";

      const formattedEndTime = editingShowtime.endTime.includes(":")
        ? editingShowtime.endTime.includes(".")
          ? editingShowtime.endTime
          : editingShowtime.endTime.split(":").length === 2
          ? editingShowtime.endTime + ":00"
          : editingShowtime.endTime
        : editingShowtime.endTime + ":00:00";

      const updatedShowtime = await updateShowtime(editingShowtime.showtimeId, {
        movie: {
          movieId: editingShowtime.movieId,
          name: selectedMovie.movieName,
        },
        showDate: editingShowtime.showDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        room: {
          id: editingShowtime.roomId,
          name: selectedRoom.name,
        },
      });

      setShowtime((prevShowtime) =>
        prevShowtime.map((showtime) =>
          showtime.showtimeId === updatedShowtime.showtimeId
            ? updatedShowtime
            : showtime
        )
      );
      setToast({
        show: true,
        message: "Sửa lịch chiếu thành công!",
        type: "success",
      });
      setshowEditModal(false);
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        show: true,
        message: "Cập nhật lịch chiếu thất bại!",
        type: "error",
      });
      console.error("Lỗi khi cập nhật lịch chiếu:", error);
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    }
    setshowEditModal(false);
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Handle select all Showtime
  const handleSelectAllShowtime = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const currentPageShowtimeIds = currentShowtime.map(
        (Showtime) => Showtime.showtimeId
      );
      setSelectedShowtime(currentPageShowtimeIds);
    } else {
      setSelectedShowtime([]);
    }
  };

  // Handle individual Showtime selection
  const handleShowtimeSelect = (showtimeId) => {
    setSelectedShowtime((prevSelected = []) =>
      prevSelected.includes(showtimeId)
        ? prevSelected.filter((id) => id !== showtimeId)
        : [...prevSelected, showtimeId]
    );
  };

  // Add this function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedShowtime.length === 0) {
      setToast({
        show: true,
        message: "Vui lòng chọn ít nhất một lịch chiếu để xóa",
        type: "error",
      });
      return;
    }

    // Open a confirmation modal for bulk deletion
    setSelectedShowtimeIds(selectedShowtime); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  // Add this function to perform the actual bulk deletion
  const confirmBulkDelete = async () => {
    try {
      // Delete each selected showtime
      for (const showtimeId of selectedShowtime) {
        await deleteShowtime(showtimeId);
      }

      // Update local state by filtering out deleted showtimes
      setShowtime((prevShowtimes) =>
        prevShowtimes.filter(
          (showtime) => !selectedShowtime.includes(showtime.showtimeId)
        )
      );

      // Clear selection
      setSelectedShowtime([]);

      // Show success notification
      setToast({
        show: true,
        message: `Đã xóa ${selectedShowtime.length} lịch chiếu thành công!`,
        type: "success",
      });

      setBulkDeleteModalOpen(false);

      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        show: true,
        message: "Xóa lịch chiếu thất bại",
        type: "error",
      });

      setBulkDeleteModalOpen(false);
      console.error("Lỗi khi xóa nhiều lịch chiếu:", error);

      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    }
  };

  // New state for toast notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch Showtime
  useEffect(() => {
    const fetchShowtime = async () => {
      try {
        setLoading(true);
        const data = await getShowtime();
        setShowtime(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Showtime");
        setLoading(false);
        console.error(err);
      }
    };

    fetchShowtime();
  }, []);

  // Toast Notification Component
  const ToastNotification = ({ message, type, show }) => {
    if (!show) return null;

    const typeStyles = {
      success: "bg-green-500",
      error: "bg-red-500",
    };

    return (
      <div
        className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
        style={{
          animation: "fadeInOut 3s ease-in-out",
          opacity: show ? 1 : 0,
        }}
      >
        {message}
      </div>
    );
  };

  // Filter Showtime based on search term and status
  const filteredShowtime = Showtime.filter((showtime) => {
    const matchesSearch = showtime.movieName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination
  const indexOfLastShowtime = currentPage * itemsPerPage;
  const indexOfFirstShowtime = indexOfLastShowtime - itemsPerPage;
  const currentShowtime = filteredShowtime.slice(
    indexOfFirstShowtime,
    indexOfLastShowtime
  );
  const totalPages = Math.ceil(filteredShowtime.length / itemsPerPage);

  const handleOpenDeleteModal = (showtimeId) => {
    setSelectedShowtimeId(showtimeId);
    setDeleteModalOpen(true);
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setSelectedShowtimeId(null);
  };

  const handleDeleteShowtime = async (showtimeId) => {
    try {
      await deleteShowtime(showtimeId);
      setShowtime((prevShowtimes) =>
        prevShowtimes.filter((showtime) => showtime.showtimeId !== showtimeId)
      );
      setToast({
        show: true,
        message: "Xóa lịch chiếu thành công!",
        type: "success",
      });
      handleCloseModal();
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setToast({
        show: true,
        message: "Xóa lịch chiếu thất bại",
        type: "error",
      });
      handleCloseModal();
      console.error("Lỗi khi xóa lịch chiếu:", error);
      setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Left sidebar - similar to the image */}

      <ToastNotification
        message={toast.message}
        type={toast.type}
        show={toast.show}
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
              className="flex items-center gap-2 py-2 px-3 bg-gray-800 rounded"
            >
              <span className="material-icons">calendar_month</span>
              <span>Lịch chiếu</span>
            </Link>
            <Link
              to="/admin/moviemanagement"
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded"
            >
              <span className="material-icons">movie</span>
              <span>Phim</span>
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
            <h1 className="text-2xl font-bold">QUẢN LÝ LỊCH CHIẾU</h1>
            <div className="flex items-center">
              <div className="relative mr-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm lịch chiếu"
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
                  <img
                    src="/avatar.png"
                    alt="Admin Avatar"
                    className="h-8 w-8 rounded-full bg-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
          {/*Add Button */}
          <div className="flex justify-between mb-6">
            <button
              className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
              onClick={() => setshowAddModal(true)}
            >
              <span className="material-icons mr-1">add</span>
              Thêm lịch chiếu
            </button>

            <button
              className={`${
                selectedShowtime.length > 0 ? "bg-red-600" : "bg-gray-400"
              } text-white px-4 py-2 rounded-md flex items-center`}
              onClick={handleBulkDelete}
              disabled={selectedShowtime.length === 0}
            >
              <span className="material-icons mr-1">delete</span>
              Xóa lịch chiếu đã chọn ({selectedShowtime.length})
            </button>
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
                          selectedShowtime.length === currentShowtime.length &&
                          currentShowtime.length > 0
                        }
                        onChange={handleSelectAllShowtime}
                      />
                    </th>
                    <th className="p-3 text-center">Tên phim</th>
                    <th className="p-3 text-center">Tên phòng</th>
                    <th className="p-3 text-center">Ngày chiếu</th>
                    <th className="p-3 text-center">Giờ bắt đầu</th>
                    <th className="p-3 text-center">Giờ kết thúc</th>
                    <th className="p-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentShowtime.map((Showtime) => (
                    <tr
                      key={Showtime.showtimeId}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5"
                          checked={selectedShowtime.includes(
                            Showtime.showtimeId
                          )}
                          onChange={() =>
                            handleShowtimeSelect(Showtime.showtimeId)
                          }
                        />
                      </td>
                      <td className="p-3 font-medium text-center">
                        {Showtime.movieName}
                      </td>
                      <td className="p-3 text-center">{Showtime.roomName}</td>
                      <td className="p-3 text-center">{Showtime.showDate}</td>
                      <td className="p-3 text-center">{Showtime.startTime}</td>
                      <td className="p-3 text-center">{Showtime.endTime}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleEditShowtime(Showtime)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          onClick={() =>
                            handleOpenDeleteModal(Showtime.showtimeId)
                          }
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <span className="material-icons">delete</span>
                        </button>

                        {/* Modal Xác Nhận Xóa */}
                        {isDeleteModalOpen && (
                          <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                              <h2 className="text-lg font-semibold mb-4">
                                Xác nhận xóa
                              </h2>
                              <p className="mb-6">
                                Bạn có chắc chắn muốn xóa lịch chiếu này không?
                              </p>
                              <div className="flex justify-end gap-4">
                                <button
                                  onClick={handleCloseModal}
                                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                  Hủy
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteShowtime(Showtime.showtimeId)
                                  }
                                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                                >
                                  Xóa
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

          {/* Bulk Delete Confirmation Modal */}
          {bulkDeleteModalOpen && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-4">
                  Xác nhận xóa hàng loạt
                </h2>
                <p className="mb-6">
                  Bạn có chắc chắn muốn xóa {selectedShowtime.length} lịch chiếu
                  đã chọn không?
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

          {showAddModal && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Thêm lịch chiếu</h2>
                <label className="block mb-2">Tên phim</label>
                <select
                  onChange={(e) => {
                    const movieId = parseInt(e.target.value);
                    setSelectedMovie(movieId);

                    // Nếu đã có startTime, tính lại endTime
                    if (startTime && movieId) {
                      const movie = movies.find((m) => m.movieId === movieId);
                      if (movie) {
                        const startDate = new Date(`2023-01-01T${startTime}`);
                        const endDate = addMinutes(startDate, movie.duration);
                        setEndTime(format(endDate, "HH:mm:ss"));
                      }
                    }
                  }}
                  className="w-full p-2 mb-3 border rounded"
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.movieId} value={movie.movieId}>
                      {movie.movieName}
                    </option>
                  ))}
                </select>
                <label className="block mb-2">Ngày chiếu</label>
                <input
                  type="date"
                  onChange={(e) => setShowDate(e.target.value)}
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Giờ bắt đầu</label>
                <input
                  type="time"
                  onChange={handleStartTimeChange}
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Giờ kết thúc</label>
                <input
                  type="time"
                  value={endTime}
                  readOnly
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Chọn phòng</label>
                <select
                  onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                      disabled={isRoomDisabled(room.id)}
                    >
                      {room.name}{" "}
                      {isRoomDisabled(room.id) ? "(Đã có lịch chiếu)" : ""}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Thêm lịch
                  </button>
                  <button
                    onClick={() => setshowAddModal(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {showEditModal && (
            <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Chỉnh sửa lịch chiếu
                </h2>
                <label className="block mb-2">Tên phim</label>
                <select
                  name="movieId"
                  value={editingShowtime.movieId || ""}
                  onChange={handleInputChangeEdit}
                  className="w-full p-2 mb-3 border rounded"
                >
                  <option value="">Chọn phim</option>
                  {movies.map((movie) => (
                    <option key={movie.movieId} value={movie.movieId}>
                      {movie.movieName}
                    </option>
                  ))}
                </select>

                <label className="block mb-2">Ngày chiếu</label>
                <input
                  type="date"
                  value={editingShowtime.showDate}
                  name="showDate"
                  onChange={handleInputChangeEdit}
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Giờ bắt đầu</label>
                <input
                  type="time"
                  name="startTime"
                  value={editingShowtime.startTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    // Cập nhật startTime trước
                    setEditingShowtime((prevState) => ({
                      ...prevState,
                      startTime: newStartTime,
                    }));

                    // Sau đó tính toán và cập nhật endTime nếu có movieId
                    if (newStartTime && editingShowtime.movieId) {
                      const movie = movies.find(
                        (m) => m.movieId === editingShowtime.movieId
                      );
                      if (movie) {
                        const startDate = new Date(
                          `2023-01-01T${newStartTime}`
                        );
                        const endDate = addMinutes(startDate, movie.duration);
                        const newEndTime = format(endDate, "HH:mm:ss");

                        // Cập nhật lại state với endTime mới
                        setEditingShowtime((prevState) => ({
                          ...prevState,
                          startTime: newStartTime, // đảm bảo startTime được cập nhật
                          endTime: newEndTime,
                        }));
                      }
                    }
                  }}
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Giờ kết thúc</label>
                <input
                  type="time"
                  name="endTime"
                  value={editingShowtime.endTime}
                  readOnly
                  className="w-full p-2 mb-3 border rounded"
                />
                <label className="block mb-2">Chọn phòng</label>
                <select
                  value={editingShowtime.roomId}
                  name="roomId"
                  onChange={(e) =>
                    setEditingShowtime({
                      ...editingShowtime,
                      roomId: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-2 mb-4 border rounded"
                >
                  <option value="">Chọn phòng</option>
                  {rooms.map((room) => (
                    <option
                      key={room.id}
                      value={room.id}
                      disabled={isRoomDisabledEdit(room.id)}
                    >
                      {room.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end mt-6 gap-3">
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                  >
                    Cập nhật
                  </button>
                  <button
                    onClick={() => setshowEditModal(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Hủy
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

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = i + 1;
                return (
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
                );
              })}

              {totalPages > 5 && <span className="mx-1 px-3 py-1">...</span>}

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
