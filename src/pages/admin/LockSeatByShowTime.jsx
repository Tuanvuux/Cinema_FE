import React, {useState, useEffect, useRef} from 'react';
import {
    getRooms,
    getLockSeatAdmin,
    getSeatsByShowtime,
    getShowTimeByRoom,
    addLockSeatAdmin,
    deleteLockSeat, checkSeatBooked
} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export default function LockSeatByShowTime () {
    const [seatsLock, setSeatsLock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    // const [selectedSeat, setSelectedSeat] = useState(null);
    const [newSeat, setNewSeat] = useState({
        seatId: '',
        seatName: '',
        roomId: '',
        roomName: '',
        showtimeId: '',
        status: 'INVALID',
    });
    const resetAddModalState = () => {
        setSelectedRoomId("");
        setSelectedShowtimeId("");
        setAvailableShowtimes([]);
        setAvailableSeats([]);
        setNewSeat({
            seatId: "",
            seatName: "",
            roomId: "",
            roomName: "",
            showtimeId: "",
            status: "INVALID",
        });
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [selectedSeatForAction, setSelectedSeatForAction] = useState(null);

    const [availableShowtimes, setAvailableShowtimes] = useState([]);
    const [availableSeats, setAvailableSeats] = useState([]);

    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [selectedShowtimeId, setSelectedShowtimeId] = useState("");
    const [errors, setErrors] = useState({});


    // const [toast, setToast] = useState({
    //     show: false,
    //     message: '',
    //     type: 'success'
    // });

    const [toast, setToast] = useState([]);

    const modalConfirmRef = useRef();
    const modalbulkDeRef = useRef();
    const modalAddRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Đóng Confirm Modal
            if (isDeleteModalOpen && modalConfirmRef.current && !modalConfirmRef.current.contains(event.target)) {
                setDeleteModalOpen(false);
                setSelectedSeatForAction(null);
            }
            if (bulkDeleteModalOpen && modalbulkDeRef.current && !modalbulkDeRef.current.contains(event.target)) {
                setBulkDeleteModalOpen(false);
            }

            if (showAddModal && modalAddRef.current && !modalAddRef.current.contains(event.target)) {
                resetAddModalState();
                setErrors({});
                setShowAddModal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDeleteModalOpen, bulkDeleteModalOpen,showAddModal]);

    const closeAddModal = () => {
        setShowAddModal(false);
        resetAddModalState();
        setErrors({});
    };


    const handleOpenDeleteModal = (seat) => {
        setSelectedSeatId(seat.lockSeatId);
        setDeleteModalOpen(true);
        setSelectedSeatForAction(seat)
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setSelectedSeatId(null);
    };
    useEffect(() => {
        getRooms().then(setRooms);
    }, []);

    const fetchShowtimesByRoom = async (roomId) => {
        try {
            const response = await getShowTimeByRoom(roomId);
            setAvailableShowtimes(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách suất chiếu:", error);
            setAvailableShowtimes([]);
        }
    };

    const fetchSeatsByShowtime = async (showtimeId) => {
        try {
            // Thay thế bằng API call thực tế
            const response = await getSeatsByShowtime(showtimeId);
            console.log("dataSeatShowtime"+ response)
            setAvailableSeats(response);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ghế:", error);
            setAvailableSeats([]);
        }
    };
    const validateForm = async () => {
        const newErrors = {};

        if (!selectedRoomId) {
            newErrors.roomId = 'Vui lòng chọn phòng';
        }

        if (!selectedShowtimeId) {
            newErrors.showtimeId = 'Vui lòng chọn lịch chiếu';
        }

        if (!newSeat.seatId) {
            newErrors.seatId = 'Vui lòng chọn ghế';
        } else {
            try {
                const seatExists = await checkSeatBooked(newSeat.seatId);
                if (seatExists) {
                    newErrors.seatId = 'Tên ghế này đã được đặt';
                }
            } catch (error) {
                console.error('Lỗi kiểm tra ghế:', error);
                newErrors.seatId = 'Không thể kiểm tra tên ghế. Vui lòng thử lại.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // khi chọn phòng → nạp suất chiếu
    const handleRoomChange = async (e)=>{
        const value = e.target.value;
        console.log("idRoom "+ value)
        setSelectedRoomId(value);
        setSelectedShowtimeId("");
        setAvailableSeats([]);
        setNewSeat(prev=>({ ...prev, roomId:value, showtimeId:"", seatId:"" }));
        if(value){
            await fetchShowtimesByRoom(value);
        } else {
            setAvailableShowtimes([]);
        }
        if (errors.roomId) {
            setErrors(prev => ({
                ...prev,
                roomId: ''
            }));
        }

        // Reset showtime và seat khi thay đổi phòng
        setSelectedShowtimeId('');
        // Xóa lỗi của showtime và seat khi reset
        setErrors(prev => ({
            ...prev,
            showtimeId: '',
            seatId: ''
        }));
    };

    // khi chọn suất → nạp ghế
    const handleShowtimeChange = async (e)=>{
        const value = e.target.value;
        setSelectedShowtimeId(value);
        setNewSeat(prev=>({...prev, showtimeId:value, seatId:""}));
        if(value){
            await fetchSeatsByShowtime(value);
        } else {
            setAvailableSeats([]);
        }

        if (errors.showtimeId) {
            setErrors(prev => ({
                ...prev,
                showtimeId: ''
            }));
        }

        // Xóa lỗi của seat khi reset
        setErrors(prev => ({
            ...prev,
            seatId: ''
        }));
    };

    // khi chọn ghế
    const handleSeatChange = (e)=>{
        const value = e.target.value;
        const seatObj = availableSeats.find(s=>s.id === value);
        setNewSeat(prev=>({...prev, seatId:value, seatName: seatObj?.name || ""}));
        if (errors.seatId ) {
            setErrors(prev => ({
                ...prev,
                seatId: ''
            }));
        }
    };

    const handleDeleteSeat = async (SeatId) =>  {
        try {
            await deleteLockSeat(SeatId);
            setSeatsLock(prevSeat =>
                prevSeat.filter(Seat => Seat.lockSeatId !== SeatId)
            );
            setToast({
                show: true,
                message: 'Xóa ghế thành công!',
                type: 'success'
            });
            handleCloseModal();
            addToast('Xóa ghế thành công!', 'success');
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa ghế thất bại',
                type: 'error'
            })
            handleCloseModal();
            console.error("Lỗi khi xóa ghế:", error);
            addToast('Xóa ghế thất bại', 'error');
        }
    };

    useEffect(() => {
        document.title = 'Quản lý Ghế cần khóa';
    }, []);


    // Handle select all Seats
    const handleSelectAllSeats = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        if (isChecked) {
            // Select all Seats on the current page
            const allSeatIds = filteredSeats.map(seat => seat.lockSeatId);
            setSelectedSeats(allSeatIds);
        } else {
            // Deselect all Seats
            setSelectedSeats([]);
        }
    };

    // Handle individual Seat selection
    const handleSeatSelect = (SeatId) => {
        setSelectedSeats(prevSelected =>
            prevSelected.includes(SeatId)
                ? prevSelected.filter(id => id !== SeatId)
                : [...prevSelected, SeatId]
        );
    };

    // Add this function to handle bulk deletion
    const handleBulkDelete = () => {
        if (selectedSeats.length === 0) {
            addToast('Vui lòng chọn ít nhất một lịch chiếu để xóa', 'error');
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
                await deleteLockSeat(SeatId);
            }

            // Update local state by filtering out deleted showtimes
            setSeatsLock(prevSeats =>
                prevSeats.filter(Seat => !selectedSeats.includes(Seat.lockSeatId))
            );

            // Clear selection
            setSelectedSeats([]);

            addToast(`Đã xóa ${selectedSeats.length} ghế thành công!`, 'success');
            setBulkDeleteModalOpen(false);

        } catch (error) {
            addToast('Xóa lịch chiếu thất bại', 'error');

            setBulkDeleteModalOpen(false);
            console.error("Lỗi khi xóa nhiều phòng chiếu:", error);

        }
    };

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                setLoading(true);
                const response = await getLockSeatAdmin();

                // Đảm bảo data là mảng
                let data = Array.isArray(response) ? response : [response];

                // Log the raw response to debug
                console.log("Raw seatlock data:", data);

                // Since we're getting SeatDTO objects from the backend, the structure should be different
                const processedSeats = data.map(seat => {
                    if (!seat) return null;

                    return {
                        lockSeatId: seat.lockSeatId || null,
                        seatId: seat.seatId || null,
                        seatName: seat.seatName || '',
                        roomId: seat.roomId || null,
                        roomName: seat.roomName || 'N/A',
                        showtimeId: seat.showtimeId || null,
                        status: seat.status || 'UNKNOWN',
                    };
                }).filter(Boolean);

                console.log("Processed seats data:", processedSeats);
                setSeatsLock(processedSeats);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải dữ liệu ghế ngồi');
                setLoading(false);
                console.error(err);
            }
        };

        fetchSeats();
    }, []);

    // Handle adding a new Seat
    const handleAddSeat = async () => {
        // Validate form trước
        const isValid = await validateForm();
        if (!isValid) return;

        try {
            // Prepare data to send to backend
            const seatData = {
                ...newSeat,
                status: 'INVALID' // Set default status
            };

            console.log("Sending seat data:", seatData); // Để debug

            const addedSeat = await addLockSeatAdmin(seatData);

            const completeSeat = {
                ...addedSeat,
                showtimeId: newSeat.showtimeId
            };
            setSeatsLock([...seatsLock, completeSeat]);

            // Show success toast
            addToast('Thêm ghế thành công!', 'success');

            // Đặt lại form và đóng modal
            resetAddModalState();
            setErrors({}); // Reset errors
            setShowAddModal(false);

        } catch (err) {
            // Hiển thị thông báo lỗi
            addToast('Thêm ghế thất bại!', 'error');
            console.error("Error adding seat:", err);
        }
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-20px); }
            5% { opacity: 1; transform: translateY(0); }
            95% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
          }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Hàm thêm toast mới
    const addToast = (message, type = 'success') => {
        const id = Date.now(); // Tạo ID duy nhất cho mỗi toast
        setToast(prev => [...prev, { id, message, type, show: true }]);

        // Tự động xóa toast sau 3 giây
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    // Hàm xóa toast
    const removeToast = (id) => {
        setToast(prev => prev.map(t =>
            t.id === id ? { ...t, show: false } : t
        ));

        // Xóa toast khỏi mảng sau khi animation kết thúc
        setTimeout(() => {
            setToast(prev => prev.filter(t => t.id !== id));
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
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`px-6 py-3 rounded-md shadow-lg flex items-center justify-between ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.3s ease'
                }}
            >
                <div className="flex items-center">
                    {type === 'success' ?
                        <CheckCircle className="mr-2 h-5 w-5 text-white" /> :
                        <AlertCircle className="mr-2 h-5 w-5 text-white" />
                    }
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

    const filteredSeats = seatsLock.filter(seat => {
        const matchesSearch = Object.values(seat).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesSearch
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

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Left sidebar - similar to the image */}
            <ToastContainer />
            <div className="flex h-full">

                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">QUẢN LÝ GHẾ CẦN KHÓA</h1>
                        <div
                            className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
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
                                <span
                                    className="material-icons absolute left-3 top-2.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300">search</span>
                            </div>
                            <UserInfo className="w-full md:w-auto"/>
                        </div>
                    </div>

                    {/* Filters and Add Button */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <button
                                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => setShowAddModal(true)}
                            >
                                <span className="material-icons mr-1">add</span>
                                Thêm ghế
                            </button>
                        </div>

                        <button
                            className={`${selectedSeats.length > 0 ? 'bg-red-600' : 'bg-gray-400'} 
                            text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform  ${
                                selectedSeats.length > 0 ? 'hover:-translate-y-1' : ''
                            }`}
                            onClick={handleBulkDelete}
                            disabled={selectedSeats.length === 0}
                        >
                            <span className="material-icons mr-1">delete</span>
                            <span className="hidden sm:inline">Xóa ghế đã chọn</span>
                            <span className="sm:hidden">Ghế đã chọn</span>
                            {selectedSeats.length > 0 && (
                                <span
                                    className="ml-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                                        {selectedSeats.length}
                                    </span>
                            )}
                        </button>
                    </div>

                    {/* Seat Table */}
                    {loading ? (
                        <div className="text-center py-10">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg p-4">
                            <span className="material-icons text-3xl mb-2">error</span>
                            <p>{error}</p>
                        </div>
                    ) : filteredSeats.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
                            <span className="material-icons text-5xl text-gray-400 mb-3">event_seat</span>
                            <h3 className="text-xl font-medium text-gray-700 mb-1">Không tìm thấy ghế</h3>
                            <p className="text-gray-500">Không có ghế nào phù hợp với tiêu chí tìm kiếm</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3 text-left w-10">
                                        <input type="checkbox"
                                               className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                               checked={selectAll || (currentSeats.length > 0 && currentSeats.every(seat => selectedSeats.includes(seat.lockSeatId)))}
                                               onChange={handleSelectAllSeats}
                                        />
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Tên
                                        ghế
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Phòng</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">ID
                                        Lịch chiếu
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Trạng
                                        thái
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Thao
                                        tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {currentSeats.map((Seatlock) => (
                                    <tr key={Seatlock.lockSeatId} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <input type="checkbox"
                                                   className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                                   checked={selectedSeats.includes(Seatlock.lockSeatId)}
                                                   onChange={() => handleSeatSelect(Seatlock.lockSeatId)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-center text-gray-900">{Seatlock.lockSeatId}</td>
                                        <td className="p-3 font-medium text-center text-gray-900">{Seatlock.seatName}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Seatlock.roomName}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Seatlock.showtimeId}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                                            <span className={`
                                                ${Seatlock.status === 'INVALID' ? 'text-red-600 font-medium' : ''}
                                            `}>
                                                {Seatlock.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center text-gray-600 hidden sm:table-cell">
                                            <div className="flex justify-center space-x-1">
                                                <button
                                                    onClick={() => handleOpenDeleteModal(Seatlock)}
                                                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
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
                                        <span className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">...</span>
                                    )}
                                </>
                            )}

                            {/* Các nút trang ở giữa */}
                            {getPageNumbers().map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`mx-1 px-3 py-1.5 rounded-md transition-all duration-200 ease-in-out ${
                                        currentPage === pageNumber
                                            ? 'bg-gray-900 text-white shadow-md transform scale-105'
                                            : 'border border-gray-300 hover:bg-gray-100'
                                    } text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-400`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            {/* Hiển thị nút trang cuối cùng khi không nằm trong danh sách trang hiện tại */}
                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                <>
                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                        <span className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">...</span>
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
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
                <div
                    className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div ref={modalConfirmRef} className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Xác nhận xóa</h2>
                        <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa ghế {selectedSeatForAction.lockSeatId} không?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDeleteSeat(selectedSeatForAction.lockSeatId)}
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
                    <div ref={modalbulkDeRef} className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Xác nhận xóa hàng loạt</h2>
                        <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa {selectedSeats.length} ghế đã chọn
                            không?</p>
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

            {showAddModal && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div ref={modalAddRef} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Thêm ghế cần khóa</h2>
                                <button onClick={() => setShowAddModal(false)}
                                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Phòng */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Chọn phòng <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedRoomId}
                                        onChange={handleRoomChange}
                                        className={`appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                            errors.roomId
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
                                        <option value="">-- Chọn phòng --</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    {errors.roomId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.roomId}</p>
                                    )}
                                </div>

                                {/* Suất chiếu */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Chọn lịch chiếu <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedShowtimeId}
                                        onChange={handleShowtimeChange}
                                        disabled={!selectedRoomId}
                                        className={`appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm disabled:bg-gray-100 ${
                                            errors.showtimeId
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
                                        <option value="">-- Chọn lịch chiếu --</option>
                                        {availableShowtimes.map(st => (
                                            <option key={st.showtimeId} value={st.showtimeId}>{st.startTime}</option>
                                        ))}
                                    </select>
                                    {errors.showtimeId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.showtimeId}</p>
                                    )}
                                </div>

                                {/* Ghế */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Chọn ghế <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newSeat.seatId}
                                        onChange={handleSeatChange}
                                        disabled={!selectedShowtimeId}
                                        className={`appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm disabled:bg-gray-100 ${
                                            errors.seatId
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
                                        <option value="">-- Chọn ghế --</option>
                                        {availableSeats.map(seat => (
                                            <option key={seat.seatId} value={seat.seatId}>{seat.seatName}</option>
                                        ))}
                                    </select>
                                    {errors.seatId && (
                                        <p className="text-red-500 text-sm mt-1">{errors.seatId}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    onClick={closeAddModal}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddSeat}
                                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Thêm ghế
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};