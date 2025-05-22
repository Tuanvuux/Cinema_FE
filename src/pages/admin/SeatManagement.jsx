import React, { useState, useEffect, useRef } from "react";
import {
  getSeats,
  addSeat,
  updateSeat,
  deleteSeat,
  getRooms,
  getSeatInfo,
  updateSeatInfo,
} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function SeatManagement() {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [seatInfo, setSeatInfos] = useState([]);
  const [error, setError] = useState(null);
  // const [selectedSeat, setSelectedSeat] = useState(null);
  const [newSeat, setNewSeat] = useState({
    seatName: "",
    roomId: "",
    rowLabel: "",
    columnNumber: 0,
    status: "AVAILABLE",
    seatInfoId: "",
  });

  const resetAddModalState = () => {
    setNewSeat({
      seatName: "",
      roomId: "",
      rowLabel: "",
      columnNumber: 0,
      status: "AVAILABLE",
      seatInfoId: seatInfo.length > 0 ? seatInfo[0].id : "",
    });
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState({
    seatId: "",
    seatName: "",
    roomId: "",
    rowLabel: "",
    columnNumber: "",
    status: "",
    seatInfoId: "",
  });
  const [editSeatInfo, setEditSeatInfo] = useState({
    id: "",
    name: "",
    price: 0,
  });
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [selectedSeatForAction, setSelectedSeatForAction] = useState(null);
  const [toast, setToast] = useState([]);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  const modalConfirmRef = useRef();
  const modalEditRef = useRef();
  const modalbulkDeRef = useRef();
  const modalEditPriceRef = useRef();
  const modalAddRef = useRef();
  const filterRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng Confirm Modal
      if (
        isDeleteModalOpen &&
        modalConfirmRef.current &&
        !modalConfirmRef.current.contains(event.target)
      ) {
        setDeleteModalOpen(false);
        setSelectedSeatForAction(null);
      }
      if (
        bulkDeleteModalOpen &&
        modalbulkDeRef.current &&
        !modalbulkDeRef.current.contains(event.target)
      ) {
        setBulkDeleteModalOpen(false);
      }
      if (
        showEditPriceModal &&
        modalEditPriceRef.current &&
        !modalEditPriceRef.current.contains(event.target)
      ) {
        setShowEditPriceModal(false);
      }

      if (
        showEditModal &&
        modalEditRef.current &&
        !modalEditRef.current.contains(event.target)
      ) {
        setShowEditModal(false);
      }
      if (
        showFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        !event.target.closest("button[data-filter-toggle]")
      ) {
        setShowFilter(false);
      }

      if (
        showAddModal &&
        modalAddRef.current &&
        !modalAddRef.current.contains(event.target)
      ) {
        resetAddModalState();
        setShowAddModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isDeleteModalOpen,
    bulkDeleteModalOpen,
    showEditModal,
    showEditPriceModal,
    showAddModal,
    showFilter,
  ]);

  const handleOpenDeleteModal = (seat) => {
    setSelectedSeatId(seat.seatId);
    setDeleteModalOpen(true);
    setSelectedSeatForAction(seat);
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setSelectedSeatId(null);
  };
  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  useEffect(() => {
    getSeatInfo().then((data) => {
      setSeatInfos(data);
      // Set the first seat info as default if available
      if (data && data.length > 0) {
        setNewSeat((prev) => ({
          ...prev,
          seatInfoId: data[0].id,
        }));
      }
    });
  }, []);

  const handleDeleteSeat = async (SeatId) => {
    try {
      await deleteSeat(SeatId);
      setSeats((prevSeat) => prevSeat.filter((Seat) => Seat.seatId !== SeatId));
      addToast("Xóa ghế thành công!", "success");
      handleCloseModal();
    } catch (error) {
      addToast("Xóa ghế thất bại", "error");
      handleCloseModal();
      console.error("Lỗi khi xóa ghế:", error);
    }
  };

  const handleEditSeat = (Seat) => {
    setEditingSeat({
      seatId: Seat.seatId,
      seatName: Seat.seatName,
      room: Seat.roomId || (Seat.room ? Seat.room.id : ""),
      rowLabel: Seat.rowLabel,
      columnNumber: Seat.columnNumber,
      status: Seat.status,
      seatInfoId: Seat.seatInfoId,
    });
    // setSelectedSeat(Seat);
    setShowEditModal(true);
  };

  useEffect(() => {
    document.title = "Quản lý ghế ngồi";
  }, []);

  const handleSaveEdit = async () => {
    try {
      const updatedSeat = await updateSeat(editingSeat.seatId, {
        seatName: editingSeat.seatName,
        rowLabel: editingSeat.rowLabel,
        roomId: editingSeat.roomId,
        columnNumber: editingSeat.columnNumber,
        status: editingSeat.status,
        seatInfoId: editingSeat.seatInfoId,
      });

      // Cập nhật danh sách phòng mà không cần tải lại trang
      setSeats((prevSeats) =>
        prevSeats.map((Seat) =>
          Seat.seatId === updatedSeat.seatId ? updatedSeat : Seat
        )
      );
      addToast("Sửa ghế thành công!", "success");
      setShowEditModal(false);
    } catch (error) {
      addToast("Cập nhật ghế thất bại!");
      console.error("Lỗi khi cập nhật phòng:", error);
    }

    setShowEditModal(false);
  };

  const handleSaveEditSeatInfo = async () => {
    try {
      const updatedSeatInfo = await updateSeatInfo(editSeatInfo.id, {
        name: editSeatInfo.name,
        price: editSeatInfo.price,
      });

      // Cập nhật danh sách phòng mà không cần tải lại trang
      setSeatInfos((prevSeatsInfo) =>
        prevSeatsInfo.map((SeatInfo) =>
          SeatInfo.id === updatedSeatInfo.id ? updatedSeatInfo : SeatInfo
        )
      );
      addToast("Sửa giá ghế thành công!", "success");
      setShowEditPriceModal(false);
    } catch (error) {
      addToast("Cập nhật giá ghế thất bại!", "error");
      console.error("Lỗi khi cập nhật giá ghế:", error);
    }

    setShowEditPriceModal(false);
  };

  // Handle select all Seats
  const handleSelectAllSeats = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      // Select all Seats on the current page
      const allSeatIds = filteredSeats.map((seat) => seat.seatId);
      setSelectedSeats(allSeatIds);
    } else {
      // Deselect all Seats
      setSelectedSeats([]);
    }
  };

  // Handle individual Seat selection
  const handleSeatSelect = (SeatId) => {
    setSelectedSeats((prevSelected) =>
      prevSelected.includes(SeatId)
        ? prevSelected.filter((id) => id !== SeatId)
        : [...prevSelected, SeatId]
    );
  };

  // Add this function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedSeats.length === 0) {
      addToast("Vui lòng chọn ít nhất một lịch chiếu để xóa", "error");
      return;
    }
    // Open a confirmation modal for bulk deletion
    setSelectedSeatIds(selectedSeats); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  // Add this function to perform the actual bulk deletion
  const confirmBulkDelete = async () => {
    try {
      // Delete each selected showtime
      for (const SeatId of selectedSeats) {
        await deleteSeat(SeatId);
      }

      // Update local state by filtering out deleted showtimes
      setSeats((prevSeats) =>
        prevSeats.filter((Seat) => !selectedSeats.includes(Seat.seatId))
      );

      // Clear selection
      setSelectedSeats([]);
      addToast(`Đã xóa ${selectedSeats.length} ghế thành công!`, "success");
      setBulkDeleteModalOpen(false);
    } catch (error) {
      addToast("Xóa lịch chiếu thất bại", "error");
      setBulkDeleteModalOpen(false);
      console.error("Lỗi khi xóa nhiều phòng chiếu:", error);
    }
  };

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await getSeats();

        // Đảm bảo data là mảng
        let data = Array.isArray(response) ? response : [response];

        // Log the raw response to debug
        console.log("Raw seat data:", data);

        // Since we're getting SeatDTO objects from the backend, the structure should be different
        const processedSeats = data
          .map((seat) => {
            if (!seat) return null;

            return {
              seatId: seat.seatId || null,
              seatName: seat.seatName || "",
              roomId: seat.roomId || null,
              roomName: seat.roomName || "N/A",
              rowLabel: seat.rowLabel || "",
              columnNumber: seat.columnNumber || 0,
              status: seat.status || "UNKNOWN",
              seatInfoId: seat.seatInfoId || null,
              seatInfoName: seat.seatInfoName || "UNKNOWN",
            };
          })
          .filter(Boolean);

        console.log("Processed seats data:", processedSeats);
        setSeats(processedSeats);
        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu ghế ngồi");
        setLoading(false);
        console.error(err);
      }
    };

    fetchSeats();
  }, []);
  // Handle adding a new Seat
  const handleAddSeat = async () => {
    try {
      // Ensure the seat has all required data
      if (
        !newSeat.seatName ||
        !newSeat.roomId ||
        !newSeat.rowLabel ||
        !newSeat.seatInfoId
      ) {
        addToast("Vui lòng điền đầy đủ thông tin!", "error");
        return;
      }

      // Prepare data to send to backend
      const seatData = {
        ...newSeat,
        status: "AVAILABLE", // Set default status
      };

      console.log("Sending seat data:", seatData); // For debugging

      const addedSeat = await addSeat(seatData);
      setSeats([...seats, addedSeat]);
      addToast("Thêm ghế thành công!", "success");
      // Reset form and close modal
      setNewSeat({
        seatName: "",
        roomId: "",
        rowLabel: "",
        columnNumber: 0,
        status: "AVAILABLE",
        seatInfoId: seatInfo.length > 0 ? seatInfo[0].id : "", // Reset to default
      });

      setShowAddModal(false);
    } catch (err) {
      addToast("Thêm ghế thất bại!", "error");
      console.error("Error adding seat:", err);
    }
  };

  const handleCancel = () => {
    resetAddModalState();
    setShowAddModal(false);
  };

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

  const filteredSeats = seats.filter((seat) => {
    const matchesSearch = Object.values(seat).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus =
      statusFilter === "all" || seat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const indexOfLastSeat = currentPage * itemsPerPage;
  const indexOfFirstSeat = indexOfLastSeat - itemsPerPage;
  const currentSeats = filteredSeats.slice(indexOfFirstSeat, indexOfLastSeat);
  const totalPages = Math.ceil(filteredSeats.length / itemsPerPage);

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

  const handleInputChangeEdit = (e) => {
    setEditingSeat({ ...editingSeat, [e.target.name]: e.target.value });
  };
  const handleInputChangeEditSeatInfo = (e) => {
    const { name, value } = e.target;

    if (name === "id") {
      // When seat type is selected, find and update price automatically
      const selectedSeatInfo = seatInfo.find(
        (seatInfo) => seatInfo.id === parseInt(value)
      );
      if (selectedSeatInfo) {
        setEditSeatInfo({
          id: selectedSeatInfo.id,
          name: selectedSeatInfo.name,
          price: selectedSeatInfo.price,
        });
      }
    } else {
      // For other fields like manually changing the price
      setEditSeatInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle input change for new Seat form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSeat((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Left sidebar - similar to the image */}
      <ToastContainer />

      <div className="flex h-full">
        {/* Main content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              QUẢN LÝ GHẾ NGỒI
            </h1>
            <div className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
              <div className="relative w-full md:w-64 group">
                <input
                  type="text"
                  placeholder="Tìm kiếm ghế ngồi"
                  className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <span className="material-icons absolute left-3 top-2 text-gray-400 group-hover:text-gray-600">
                  search
                </span>
              </div>
              <UserInfo className="w-full md:w-auto" />
            </div>
          </div>

          {/* Filters and Add Button */}
          <div className="flex justify-between mb-6 relative">
            <div className="flex items-center">
              <button
                className="mr-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all flex items-center"
                onClick={() => setShowFilter(!showFilter)}
                data-filter-toggle
              >
                <span className="material-icons text-gray-600">
                  filter_list
                </span>
                <span className="ml-2 text-gray-700">Bộ lọc</span>
              </button>
              {/* Dropdown filter */}
              {showFilter && (
                <div
                  ref={filterRef}
                  className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 top-14 left-0 w-64 animate-fadeIn"
                >
                  <div className="font-medium text-gray-800 mb-3 ">
                    <h3 className="font-medium text-gray-800 mb-3 border-b pb-2">
                      Lọc theo trạng thái
                    </h3>
                    <div className="flex flex-col space-y-3">
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                        <input
                          type="radio"
                          name="status"
                          value="all"
                          checked={statusFilter === "all"}
                          onChange={() => setStatusFilter("all")}
                          className="mr-2 h-4 w-4 accent-gray-900"
                        />
                        <span className="text-gray-700">Tất cả</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                        <input
                          type="radio"
                          name="status"
                          value="AVAILABLE"
                          checked={statusFilter === "AVAILABLE"}
                          onChange={() => setStatusFilter("AVAILABLE")}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Chưa chọn</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                        <input
                          type="radio"
                          name="status"
                          value="SELECTED"
                          checked={statusFilter === "SELECTED"}
                          onChange={() => setStatusFilter("SELECTED")}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Đã chọn</span>
                      </label>
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                        <input
                          type="radio"
                          name="status"
                          value="BOOKED"
                          checked={statusFilter === "BOOKED"}
                          onChange={() => setStatusFilter("BOOKED")}
                          className="mr-2"
                        />
                        <span className="text-gray-700">Đã đặt</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <button
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => setShowAddModal(true)}
              >
                <span className="material-icons mr-1">add</span>
                Thêm ghế
              </button>

              <button
                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                onClick={() => setShowEditPriceModal(true)}
              >
                <span className="material-icons mr-1">edit</span>
                Sửa giá ghế
              </button>
            </div>

            <button
              className={`${
                selectedSeats.length > 0
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              } 
                            text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                              selectedSeats.length > 0
                                ? "hover:-translate-y-1"
                                : ""
                            }`}
              onClick={handleBulkDelete}
              disabled={selectedSeats.length === 0}
            >
              <span className="material-icons mr-1">delete</span>
              <span className="hidden sm:inline">Xóa ghế đã chọn</span>
              <span className="sm:hidden">Ghế đã chọn</span>
              {selectedSeats.length > 0 && (
                <span className="ml-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {selectedSeats.length}
                </span>
              )}
            </button>
          </div>

          {/* Seat Table */}
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg p-4">
              <span className="material-icons text-3xl mb-2">error</span>
              <p>{error}</p>
            </div>
          ) : filteredSeats.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
              <span className="material-icons text-5xl text-gray-400 mb-3">
                event_seat
              </span>
              <h3 className="text-xl font-medium text-gray-700 mb-1">
                Không tìm thấy ghế
              </h3>
              <p className="text-gray-500">
                Không có ghế nào phù hợp với tiêu chí tìm kiếm
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-3 text-left w-10">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                        checked={
                          selectAll ||
                          (currentSeats.length > 0 &&
                            currentSeats.every((seat) =>
                              selectedSeats.includes(seat.seatId)
                            ))
                        }
                        onChange={handleSelectAllSeats}
                      />
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Tên ghế
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Phòng
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Tên hàng ghế
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Số cột ghế
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Trạng thái
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                      Loại ghế
                    </th>
                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentSeats.map((Seat) => (
                    <tr
                      key={Seat.seatId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                          checked={selectedSeats.includes(Seat.seatId)}
                          onChange={() => handleSeatSelect(Seat.seatId)}
                        />
                      </td>
                      <td className="p-3 font-medium text-center text-gray-900">
                        {Seat.seatId}
                      </td>
                      <td className="p-3 font-medium text-center text-gray-900">
                        {Seat.seatName}
                      </td>
                      <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                        {Seat.roomName || "N/A"}
                      </td>
                      <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                        {Seat.rowLabel}
                      </td>
                      <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                        {Seat.columnNumber}
                      </td>
                      <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                        <span
                          className={`
                                                ${
                                                  Seat.status === "AVAILABLE"
                                                    ? "text-green-600 font-medium"
                                                    : ""
                                                }
                                                ${
                                                  Seat.status === "SELECTED"
                                                    ? "text-blue-600 font-medium"
                                                    : ""
                                                }
                                                ${
                                                  Seat.status === "BOOKED"
                                                    ? "text-purple-600 font-medium"
                                                    : ""
                                                }
                                                ${
                                                  Seat.status === "INVALID"
                                                    ? "text-red-600 font-medium"
                                                    : ""
                                                }
                                            `}
                        >
                          {Seat.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">{Seat.seatInfoName}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => handleEditSeat(Seat)}
                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors"
                          >
                            <span className="material-icons">edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(Seat)}
                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

      {isDeleteModalOpen && selectedSeatForAction && (
        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
          <div
            ref={modalConfirmRef}
            className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Xác nhận xóa
            </h2>
            <p className="mb-6 text-gray-600">
              Bạn có chắc chắn muốn xóa ghế {selectedSeatForAction.seatId}{" "}
              không?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDeleteSeat(selectedSeatForAction.seatId)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Xóa
              </button>
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
              Xác nhận xóa hàng loạt
            </h2>
            <p className="mb-6 text-gray-600">
              Bạn có chắc chắn muốn xóa {selectedSeats.length} ghế đã chọn
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
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
          <div
            ref={modalEditRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
          >
            <div className="p-6 max-w-2xl w-full mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Chỉnh sửa phòng chiếu
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên ghế
                  </label>
                  <input
                    type="text"
                    id="seatName"
                    name="seatName"
                    value={editingSeat.seatName}
                    onChange={handleInputChangeEdit}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên phòng
                  </label>
                  <select
                    name="room"
                    value={editingSeat.room || ""}
                    onChange={handleInputChangeEdit}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <div>
                    <label
                      htmlFor="seatCount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên cột
                    </label>
                    <input
                      type="text"
                      id="rowLabel"
                      name="rowLabel"
                      value={editingSeat.rowLabel}
                      onChange={handleInputChangeEdit}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số dòng ghế
                    </label>
                    <input
                      type="number"
                      id="columnNumber"
                      name="columnNumber"
                      value={editingSeat.columnNumber}
                      onChange={handleInputChangeEdit}
                      placeholder="Nhập số dòng ghế"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center relative cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="AVAILABLE"
                        checked={editingSeat.status === "AVAILABLE"}
                        onChange={() =>
                          setEditingSeat({
                            ...editingSeat,
                            status: "AVAILABLE",
                          })
                        }
                        className="absolute opacity-0 cursor-pointer"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                ${
                                  editingSeat.status === "AVAILABLE"
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-white border-gray-300"
                                }`}
                      >
                        {editingSeat.status === "AVAILABLE" && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span>Chưa đặt</span>
                    </label>
                    <label className="inline-flex items-center relative cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="SELECTED"
                        checked={editingSeat.status === "SELECTED"}
                        onChange={() =>
                          setEditingSeat({ ...editingSeat, status: "SELECTED" })
                        }
                        className="absolute opacity-0 cursor-pointer"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                ${
                                  editingSeat.status === "SELECTED"
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-white border-gray-300"
                                }`}
                      >
                        {editingSeat.status === "SELECTED" && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span>Đã chọn</span>
                    </label>
                    <label className="inline-flex items-center relative cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="BOOKED"
                        checked={editingSeat.status === "BOOKED"}
                        onChange={() =>
                          setEditingSeat({ ...editingSeat, status: "BOOKED" })
                        }
                        className="absolute opacity-0 cursor-pointer"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                ${
                                  editingSeat.status === "BOOKED"
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-white border-gray-300"
                                }`}
                      >
                        {editingSeat.status === "BOOKED" && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span>Đã đặt</span>
                    </label>
                    <label className="inline-flex items-center relative cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="INVALID"
                        checked={editingSeat.status === "INVALID"}
                        onChange={() =>
                          setEditingSeat({ ...editingSeat, status: "INVALID" })
                        }
                        className="absolute opacity-0 cursor-pointer"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                ${
                                  editingSeat.status === "INVALID"
                                    ? "bg-gray-900 border-gray-900"
                                    : "bg-white border-gray-300"
                                }`}
                      >
                        {editingSeat.status === "INVALID" && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <span>Vô hiệu hóa</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại ghế
                  </label>
                  <div className="flex items-center space-x-4">
                    {seatInfo.map((info) => (
                      <label
                        key={info.id}
                        className="inline-flex items-center relative cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="seatInfoId"
                          value={info.id}
                          checked={editingSeat.seatInfoId === info.id}
                          onChange={() =>
                            setEditingSeat({
                              ...editingSeat,
                              seatInfoId: info.id,
                            })
                          }
                          className="absolute opacity-0 cursor-pointer"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                    ${
                      editingSeat.seatInfoId === info.id
                        ? "bg-gray-900 border-gray-900"
                        : "bg-white border-gray-300"
                    }`}
                        >
                          {editingSeat.seatInfoId === info.id && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                        <span>{info.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600"
                  disabled={!editingSeat.seatName}
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Seat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
          <div
            ref={modalAddRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Thêm ghế mới
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="seatName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên Ghế
                  </label>
                  <input
                    type="text"
                    id="seatName"
                    name="seatName"
                    value={newSeat.seatName}
                    onChange={(e) => {
                      handleInputChange(e);
                      console.log("Seat Name:", e.target.value);
                    }}
                    placeholder="Nhập tên phòng chiếu"
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="room"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tên phòng
                  </label>
                  <select
                    id="roomId"
                    name="roomId"
                    value={newSeat.roomId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <div>
                    <label
                      htmlFor="rowLabel"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên hàng ghế
                    </label>
                    <input
                      type="text"
                      id="rowLabel"
                      name="rowLabel"
                      value={newSeat.rowLabel}
                      onChange={handleInputChange}
                      placeholder="Nhập số cột ghế"
                      className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="columnNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Số cột ghế
                    </label>
                    <input
                      type="number"
                      id="columnNumber"
                      name="columnNumber"
                      value={newSeat.columnNumber}
                      onChange={handleInputChange}
                      placeholder="Nhập số cột ghế"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddSeat}
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600"
                >
                  Thêm ghế
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditPriceModal && (
        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
          <div
            ref={modalEditPriceRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Sửa giá ghế</h2>
                <button
                  onClick={() => setShowEditPriceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div>
                    <label
                      htmlFor="id"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tên loại ghế
                    </label>
                    <select
                      id="id"
                      name="id"
                      value={editSeatInfo.id}
                      onChange={handleInputChangeEditSeatInfo}
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                    >
                      <option value="">Chọn loại ghế</option>
                      {seatInfo.map((seatinfo) => (
                        <option key={seatinfo.id} value={seatinfo.id}>
                          {seatinfo.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Giá loại ghế
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={editSeatInfo.price}
                      onChange={handleInputChangeEditSeatInfo}
                      placeholder="Nhập giá ghế"
                      className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-3">
                <button
                  onClick={() => setShowEditPriceModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEditSeatInfo}
                  className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
