import React, {useState, useEffect, useRef} from 'react';
import {
    getRooms,
    getLockSeatAdmin,
    getSeatsByShowtime,
    getShowTimeByRoom,
    addLockSeatAdmin,
    deleteLockSeat
} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";


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
    };

    // khi chọn ghế
    const handleSeatChange = (e)=>{
        const value = e.target.value;
        const seatObj = availableSeats.find(s=>s.id === value);
        setNewSeat(prev=>({...prev, seatId:value, seatName: seatObj?.name || ""}));
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
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa ghế thất bại',
                type: 'error'
            })
            handleCloseModal();
            console.error("Lỗi khi xóa ghế:", error);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        }
    };

    useEffect(() => {
        document.title = 'Quản lý trạng thái ghế';
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
            setToast({
                show: true,
                message: 'Vui lòng chọn ít nhất một lịch chiếu để xóa',
                type: 'error'
            });
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

            // Show success notification
            setToast({
                show: true,
                message: `Đã xóa ${selectedSeats.length} ghế thành công!`,
                type: 'success'
            });

            setBulkDeleteModalOpen(false);

            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa lịch chiếu thất bại',
                type: 'error'
            });

            setBulkDeleteModalOpen(false);
            console.error("Lỗi khi xóa nhiều phòng chiếu:", error);

            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        }
    };

    // New state for toast notification
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });


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
        try {
            // Đảm bảo ghế có tất cả dữ liệu cần thiết
            if (!newSeat.seatId || !newSeat.roomId || !newSeat.showtimeId) {
                setToast({
                    show: true,
                    message: 'Vui lòng điền đầy đủ thông tin!',
                    type: 'error'
                });
                return;
            }

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
            setToast({
                show: true,
                message: 'Thêm ghế thành công!',
                type: 'success'
            });

            // Đặt lại form và đóng modal
            resetAddModalState();
            setShowAddModal(false);

            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
        } catch (err) {
            // Hiển thị thông báo lỗi
            setToast({
                show: true,
                message: 'Thêm ghế thất bại!',
                type: 'error'
            });

            console.error("Error adding seat:", err);

            setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000);
        }
    };

    // Toast Notification Component
    const ToastNotification = ({ message, type, show }) => {
        if (!show) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ' +
                        'ease-in-out',
                    opacity: show ? 1 : 0
                }}
            >
                {message}
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
        <div className="flex flex-col h-screen">
            {/* Left sidebar - similar to the image */}

            <ToastNotification
                message={toast.message}
                type={toast.type}
                show={toast.show}
            />

            <div className="flex h-full">

                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
                        <h1 className="text-xl md:text-2xl font-bold">QUẢN LÝ TRẠNG THÁI GHẾ</h1>
                        <div className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4">
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm ghế ngồi"
                                    className="border rounded-md py-2 px-4 pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                            </div>
                            <UserInfo className="w-full md:w-auto"/>
                        </div>
                    </div>

                    {/* Filters and Add Button */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <button
                                className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
                                onClick={() => setShowAddModal(true)}
                            >
                                <span className="material-icons mr-1">add</span>
                                Thêm ghế
                            </button>
                        </div>

                        <button
                            className={`${selectedSeats.length > 0 ? 'bg-red-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center`}
                            onClick={handleBulkDelete}
                            disabled={selectedSeats.length === 0}
                        >
                            <span className="material-icons mr-1">delete</span>
                            Xóa ghế đã chọn ({selectedSeats.length})
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
                        <div className="text-center py-10 text-red-500">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                                <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3 text-left w-12">
                                        <input type="checkbox" className="form-checkbox h-5 w-5"
                                               checked={selectAll || (currentSeats.length > 0 && currentSeats.every(seat => selectedSeats.includes(seat.lockSeatId)))}
                                               onChange={handleSelectAllSeats}
                                        />
                                    </th>
                                    <th className="p-3 text-center">ID</th>
                                    <th className="p-3 text-center">Tên ghế</th>
                                    <th className="p-3 text-center">Phòng</th>
                                    <th className="p-3 text-center">ID Lịch chiếu</th>
                                    <th className="p-3 text-center">Trạng thái</th>
                                    <th className="p-3 text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentSeats.map((Seatlock) => (
                                    <tr key={Seatlock.lockSeatId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <input type="checkbox" className="form-checkbox h-5 w-5"
                                                   checked={selectedSeats.includes(Seatlock.lockSeatId)}
                                                   onChange={() => handleSeatSelect(Seatlock.lockSeatId)}
                                            />
                                        </td>
                                        <td className="p-3 text-center">{Seatlock.lockSeatId}</td>
                                        <td className="p-3 font-medium text-center">{Seatlock.seatName}</td>
                                        <td className="p-3 text-center">{Seatlock.roomName}</td>
                                        <td className="p-3 text-center">{Seatlock.showtimeId}</td>
                                        <td className="p-3 text-center">
                                            <span className={`
                                                ${Seatlock.status === 'INVALID' ? 'text-red-600 font-medium' : ''}
                                            `}>
                                                {Seatlock.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleOpenDeleteModal(Seatlock)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination.jsx */}
                    <div className="flex flex-wrap justify-center mt-6 gap-1">
                        <div className="flex flex-wrap justify-center items-center gap-1">
                            {/* Nút về trang đầu tiên */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
                                title="Trang đầu"
                            >
                                &laquo;
                            </button>

                            {/* Nút trang trước */}
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
                            >
                                &lt;
                            </button>

                            {/* Hiển thị nút trang đầu tiên khi không nằm trong danh sách trang hiện tại */}
                            {getPageNumbers()[0] > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="mx-1 px-3 py-1 rounded border"
                                    >
                                        1
                                    </button>
                                    {getPageNumbers()[0] > 2 && (
                                        <span className="mx-1 px-3 py-1">...</span>
                                    )}
                                </>
                            )}

                            {/* Các nút trang ở giữa */}
                            {getPageNumbers().map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`mx-1 px-3 py-1 rounded ${
                                        currentPage === pageNumber
                                            ? 'bg-gray-900 text-white'
                                            : 'border'
                                    }`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            {/* Hiển thị nút trang cuối cùng khi không nằm trong danh sách trang hiện tại */}
                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                <>
                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                        <span className="mx-1 px-3 py-1">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="mx-1 px-3 py-1 rounded border"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            {/* Nút trang tiếp theo */}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
                            >
                                &gt;
                            </button>

                            {/* Nút tới trang cuối cùng */}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
                                title="Trang cuối"
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isDeleteModalOpen && selectedSeatForAction &&(
                <div
                    className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div ref={modalConfirmRef} className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa ghế {selectedSeatForAction.lockSeatId} không?</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleDeleteSeat(selectedSeatForAction.lockSeatId)}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
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
                    <div ref={modalbulkDeRef} className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa hàng loạt</h2>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa {selectedSeats.length} ghế đã chọn
                            không?</p>
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
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div ref={modalAddRef} className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Thêm ghế cần khóa</h2>
                            <button onClick={()=>setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Phòng */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn phòng</label>
                                <select value={selectedRoomId} onChange={handleRoomChange} className="w-full p-2 border rounded">
                                    <option value="">-- Chọn phòng --</option>
                                    {rooms.map(r=>(<option key={r.id} value={r.id}>{r.name}</option>))}
                                </select>
                            </div>

                            {/* Suất chiếu */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn lịch chiếu</label>
                                <select value={selectedShowtimeId} onChange={handleShowtimeChange} disabled={!selectedRoomId}
                                        className="w-full p-2 border rounded disabled:bg-gray-100">
                                    <option value="">-- Chọn lịch chiếu --</option>
                                    {availableShowtimes.map(st=> (<option key={st.showtimeId} value={st.showtimeId}>{st.startTime}</option>))}
                                </select>
                            </div>

                            {/* Ghế */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Chọn ghế</label>
                                <select value={newSeat.seatId} onChange={handleSeatChange} disabled={!selectedShowtimeId}
                                        className="w-full p-2 border rounded disabled:bg-gray-100">
                                    <option value="">-- Chọn ghế --</option>
                                    {availableSeats.map(seat=>(<option key={seat.seatId} value={seat.seatId}>{seat.seatName}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 gap-3">
                            <button onClick={closeAddModal} className="px-4 py-2 border rounded-md hover:bg-gray-100">Hủy</button>
                            <button onClick={handleAddSeat} className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800" disabled={!newSeat.seatId}>Thêm ghế</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};