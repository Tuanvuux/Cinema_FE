import React, { useState, useEffect } from 'react';
import {getRooms, addRoom, updateRoom, deleteRoom} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";


export default function RoomManagement () {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [error, setError] = useState(null);
    // const [selectedRoom, setSelectedRoom] = useState(null);
    const [newRoom, setNewRoom] = useState({
        name: '',
        seatCount: 0,
        status: 'ACTIVE',
        numberOfColumns: 0,
        numberOfRows: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState({ id: '', name: '', seatCount: '',numberOfColumns: '',
                                                                    numberOfRows:'', status: '' , createdAt: ''});
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);

    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [selectedShowtimeIds, setSelectedRoomIds] = useState([]);

    const handleOpenDeleteModal = (showtimeId) => {
        setSelectedRoomId(showtimeId);
        setDeleteModalOpen(true);
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setSelectedRoomId(null);
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            setRooms(prevRoom =>
                prevRoom.filter(room => room.id !== roomId)
            );
            setToast({
                show: true,
                message: 'Xóa phòng chiếu thành công!',
                type: 'success'
            });
            handleCloseModal();
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa phòng chiếu thất bại',
                type: 'error'
            })
            handleCloseModal();
            console.error("Lỗi khi xóa phòng chiếu:", error);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'error' });
            }, 3000);
        }
    };

    const handleEditRoom = (room) => {
        setEditingRoom(room);
        // setSelectedRoom(room);
        setShowEditModal(true);
    };

    useEffect(() => {
        document.title = 'Quản lý phòng chiếu';
    }, []);

    const handleSaveEdit = async () => {
        try {
            const updatedRoom = await updateRoom(editingRoom.id, {
                name: editingRoom.name,
                seatCount: editingRoom.seatCount,
                numberOfColumns: editingRoom.numberOfColumns,
                numberOfRows: editingRoom.numberOfRows,
                status: editingRoom.status,
            });

            // Cập nhật danh sách phòng mà không cần tải lại trang
            setRooms((prevRooms) =>
                prevRooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
            );
            setToast({
                show: true,
                message: 'Sửa phòng thành công!',
                type: 'success'
            });
            setShowEditModal(false);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Cập nhật phòng thất bại!',
                type: 'error'
            })
            console.error("Lỗi khi cập nhật phòng:", error);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        }

        setShowEditModal(false);
        setTimeout(() => {
            setToast({show: false, message: '', type: 'success'});
        }, 3000);
    };

    // Handle select all rooms
    const handleSelectAllRooms = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        if (isChecked) {
            // Select all rooms on the current page
            const allRoomIds = filteredRooms.map(room => room.id);
            setSelectedRooms(allRoomIds);
        } else {
            // Deselect all rooms
            setSelectedRooms([]);
        }
    };

    // Handle individual room selection
    const handleRoomSelect = (roomId) => {
        setSelectedRooms(prevSelected =>
            prevSelected.includes(roomId)
                ? prevSelected.filter(id => id !== roomId)
                : [...prevSelected, roomId]
        );
    };

    // Add this function to handle bulk deletion
    const handleBulkDelete = () => {
        if (selectedRooms.length === 0) {
            setToast({
                show: true,
                message: 'Vui lòng chọn ít nhất một lịch chiếu để xóa',
                type: 'error'
            });
            return;
        }

        // Open a confirmation modal for bulk deletion
        setSelectedRoomIds(selectedRooms); // Store all selected IDs
        setBulkDeleteModalOpen(true);
    };

// Add this function to perform the actual bulk deletion
    const confirmBulkDelete = async () => {
        try {
            // Delete each selected showtime
            for (const roomId of selectedRooms) {
                await deleteRoom(roomId);
            }

            // Update local state by filtering out deleted showtimes
            setRooms(prevRooms =>
                prevRooms.filter(room => !selectedRooms.includes(room.id))
            );

            // Clear selection
            setSelectedRooms([]);

            // Show success notification
            setToast({
                show: true,
                message: `Đã xóa ${selectedRooms.length} phòng chiếu thành công!`,
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

    // Fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true);
                const data = await getRooms();
                setRooms(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch rooms');
                setLoading(false);
                console.error(err);
            }
        };

        fetchRooms();
    }, []);

    // Handle adding a new room
    const handleAddRoom = async () => {
        try {
            const addedRoom = await addRoom(newRoom);
            setRooms([...rooms, addedRoom]);
            // Show success toast
            setToast({
                show: true,
                message: 'Thêm phòng thành công!',
                type: 'success'
            });
            // Reset form and close modal
            setNewRoom({
                name: '',
                seatCount: 0,
                status: 'ACTIVE'
            });
            setShowAddModal(false);
            // Automatically hide toast after 3 seconds
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (err) {
            // Show error toast
            setToast({
                show: true,
                message: 'Thêm phòng thất bại!',
                type: 'error'
            })

            console.error(err);

            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
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
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: show ? 1 : 0
                }}
            >
                {message}
            </div>
        );
    };

    // Handle updating a room's status
    const handleStatusChange = async (roomId, status) => {
        try {
            const roomToUpdate = rooms.find(room => room.id === roomId);
            if (roomToUpdate) {
                const updatedRoom = { ...roomToUpdate, status };
                await updateRoom(roomId, updatedRoom);

                // Update local state
                setRooms(rooms.map(room => room.id === roomId ? { ...room, status } : room));
            }
        } catch (err) {
            setError('Failed to update room status');
            console.error(err);
        }
    };


    const filteredRooms = rooms.filter(room => {
        const matchesSearch = Object.values(room).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && room.status === 'ACTIVE') ||
                (statusFilter === 'inactive' && room.status === 'INACTIVE');

        return matchesSearch && matchesStatus;
    });


    // Calculate pagination
    const indexOfLastRoom = currentPage * itemsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - itemsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);

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
        setEditingRoom({ ...editingRoom, [e.target.name]: e.target.value });
    };

    // Handle input change for new room form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoom({
            ...newRoom,
            [name]: name === 'seatCount' ? parseInt(value, 10) : value
        });
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
                <div className="flex-1 p-4 md:p-6 overflow-auto">
                    {/* Header section */}
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-4">
                        <h1 className="text-xl md:text-2xl font-bold">QUẢN LÝ PHÒNG CHIẾU</h1>
                        <div
                            className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4">
                            <div className="relative w-full md:w-64">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phòng chiếu"
                                    className="border rounded-md py-2 px-4 pl-10 w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                            </div>
                            <UserInfo className="w-full md:w-auto"/>
                        </div>
                    </div>

                    {/* Filters and Add Button */}
                    <div className="flex flex-col md:flex-row justify-between mb-6 relative gap-4">
                        <div className="flex items-center">
                        <button className="mr-2 p-2 border rounded hover:bg-gray-100"
                                    onClick={() => setShowFilter(!showFilter)}>
                                <span className="material-icons">filter_list</span>
                            </button>
                            {/* Dropdown filter */}
                            {showFilter && (
                                <div className="absolute z-10 bg-white border rounded shadow-md p-3 top-12 left-0 w-64">
                                    <div className="flex flex-col space-x-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="all"
                                                checked={statusFilter === 'all'}
                                                onChange={() => setStatusFilter('all')}
                                                className="mr-1"
                                            />
                                            <span>Tất cả</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={statusFilter === 'active'}
                                                onChange={() => setStatusFilter('active')}
                                                className="mr-1"
                                            />
                                            <span>Mở</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={statusFilter === 'inactive'}
                                                onChange={() => setStatusFilter('inactive')}
                                                className="mr-1"
                                            />
                                            <span>Khóa</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-2 w-full md:w-auto">
                            <button
                                className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center justify-center"
                                onClick={() => setShowAddModal(true)}
                            >
                                <span className="material-icons mr-1">add</span>
                                Thêm phòng
                            </button>

                            <button
                                className={`${selectedRooms.length > 0 ? 'bg-red-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center justify-center`}
                                onClick={handleBulkDelete}
                                disabled={selectedRooms.length === 0}
                            >
                                <span className="material-icons mr-1">delete</span>
                                <span className="hidden sm:inline">Xóa phòng lịch chiếu đã chọn</span>
                                <span className="sm:hidden">Xóa đã chọn</span>
                                ({selectedRooms.length})
                            </button>
                        </div>
                    </div>

                    {/* Room Table */}
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
                                    <th className="p-2 md:p-3 text-left w-10">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 md:h-5 md:w-5"
                                            checked={selectAll || (currentRooms.length > 0 && currentRooms.every(room => currentRooms.includes(room.id)))}
                                            onChange={handleSelectAllRooms}
                                        />
                                    </th>
                                    <th className="p-2 md:p-3 text-center">Tên phòng</th>
                                    <th className="p-2 md:p-3 text-center hidden sm:table-cell">Sức chứa</th>
                                    <th className="p-2 md:p-3 text-center hidden sm:table-cell">Số cột</th>
                                    <th className="p-2 md:p-3 text-center hidden sm:table-cell">Số hàng</th>
                                    <th className="p-2 md:p-3 text-center">Trạng thái</th>
                                    <th className="p-2 md:p-3 text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentRooms.map((room) => (
                                    <tr key={room.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 md:p-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-4 w-4 md:h-5 md:w-5"
                                                checked={selectedRooms.includes(room.id)}
                                                onChange={() => handleRoomSelect(room.id)}
                                            />
                                        </td>
                                        <td className="p-2 md:p-3 font-medium text-center">{room.name}</td>
                                        <td className="p-2 md:p-3 text-center hidden sm:table-cell">{room.seatCount}</td>
                                        <td className="p-2 md:p-3 text-center hidden sm:table-cell">{room.numberOfColumns}</td>
                                        <td className="p-2 md:p-3 text-center hidden sm:table-cell">{room.numberOfRows}</td>
                                        <td className="p-2 md:p-3 text-center">
                                            <div className="flex justify-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={room.status === 'ACTIVE'}
                                                        onChange={() => handleStatusChange(
                                                            room.id,
                                                            room.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                                        )}
                                                    />
                                                    <div
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="p-2 md:p-3 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button
                                                    onClick={() => handleEditRoom(room)}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    aria-label="Edit"
                                                >
                                                    <span className="material-icons">edit</span>
                                                </button>
                                                {isDeleteModalOpen && (
                                                    <div
                                                        className="fixed inset-0 bg-gray-800/5 flex items-center justify-center z-50">
                                                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                                            <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                                                            <p className="mb-6">Bạn có chắc chắn muốn xóa lịch chiếu này
                                                                không?</p>
                                                            <div className="flex justify-end gap-4">
                                                                <button
                                                                    onClick={handleCloseModal}
                                                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                                >
                                                                    Hủy
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteRoom(room.id)}
                                                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex flex-wrap justify-center mt-6 gap-1">
                        <div className="flex flex-wrap justify-center items-center gap-1">
                            {/* Nút về trang đầu tiên */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border disabled:opacity-50 text-sm md:text-base"
                                title="Trang đầu"
                            >
                                &laquo;
                            </button>

                            {/* Nút trang trước */}
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border disabled:opacity-50 text-sm md:text-base"
                            >
                                &lt;
                            </button>

                            {/* Hiển thị nút trang đầu tiên khi không nằm trong danh sách trang hiện tại */}
                            {getPageNumbers()[0] > 1 && (
                                <>
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border text-sm md:text-base"
                                    >
                                        1
                                    </button>
                                    {getPageNumbers()[0] > 2 && (
                                        <span className="mx-1 px-2 py-1 text-sm md:text-base">...</span>
                                    )}
                                </>
                            )}

                            {/* Các nút trang ở giữa */}
                            {getPageNumbers().map(pageNumber => (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`mx-1 px-2 py-1 md:px-3 md:py-1 rounded ${
                                        currentPage === pageNumber
                                            ? 'bg-gray-900 text-white'
                                            : 'border'
                                    } text-sm md:text-base`}
                                >
                                    {pageNumber}
                                </button>
                            ))}

                            {/* Hiển thị nút trang cuối cùng khi không nằm trong danh sách trang hiện tại */}
                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                <>
                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                        <span className="mx-1 px-2 py-1 text-sm md:text-base">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border text-sm md:text-base"
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            {/* Nút trang tiếp theo */}
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border disabled:opacity-50 text-sm md:text-base"
                            >
                                &gt;
                            </button>

                            {/* Nút tới trang cuối cùng */}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-2 py-1 md:px-3 md:py-1 rounded border disabled:opacity-50 text-sm md:text-base"
                                title="Trang cuối"
                            >
                                &raquo;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 sm:w-96 mx-4">
                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa hàng loạt</h2>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa {selectedRooms.length} phòng chiếu đã chọn
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Chỉnh sửa phòng chiếu</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên phòng
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editingRoom.name}
                                        onChange={handleInputChangeEdit}
                                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="seatCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sức chứa (số ghế)
                                    </label>
                                    <input
                                        type="number"
                                        id="seatCount"
                                        name="seatCount"
                                        value={editingRoom.seatCount}
                                        onChange={handleInputChangeEdit}
                                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfColumns"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Số cột ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfColumns"
                                            name="numberOfColumns"
                                            value={editingRoom.numberOfColumns}
                                            onChange={handleInputChangeEdit}
                                            placeholder="Nhập số cột ghế"
                                            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfRows"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Số dòng ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfRows"
                                            name="numberOfRows"
                                            value={editingRoom.numberOfRows}
                                            onChange={handleInputChangeEdit}
                                            placeholder="Nhập số dòng ghế"
                                            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày tạo
                                    </label>
                                    <input
                                        type="text"
                                        id="createdAt"
                                        name="createdAt"
                                        value={editingRoom.createdAt}
                                        placeholder="Nhập loại màn hình chiếu"
                                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        required
                                        readOnly
                                    />
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
                                                value="ACTIVE"
                                                checked={editingRoom.status === 'ACTIVE'}
                                                onChange={() => setEditingRoom({...editingRoom, status: 'ACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                        ${editingRoom.status === 'ACTIVE'
                                                ? 'bg-gray-900 border-gray-900'
                                                : 'bg-white border-gray-300'}`}>
                                                {editingRoom.status === 'ACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span>Hoạt động</span>
                                        </label>
                                        <label className="inline-flex items-center relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="INACTIVE"
                                                checked={editingRoom.status === 'INACTIVE'}
                                                onChange={() => setEditingRoom({...editingRoom, status: 'INACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                        ${editingRoom.status === 'INACTIVE'
                                                ? 'bg-gray-900 border-gray-900'
                                                : 'bg-white border-gray-300'}`}>
                                                {editingRoom.status === 'INACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span>Không hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                                    disabled={!editingRoom.name || editingRoom.seatCount <= 0}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Thêm phòng chiếu mới</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên phòng
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newRoom.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên phòng chiếu"
                                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="seatCount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Sức chứa (số ghế)
                                    </label>
                                    <input
                                        type="number"
                                        id="seatCount"
                                        name="seatCount"
                                        value={newRoom.seatCount}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượng ghế"
                                        className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfColumns"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Số cột ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfColumns"
                                            name="numberOfColumns"
                                            value={newRoom.numberOfColumns}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số cột ghế"
                                            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfRows"
                                               className="block text-sm font-medium text-gray-700 mb-1">
                                            Số dòng ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfRows"
                                            name="numberOfRows"
                                            value={newRoom.numberOfRows}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số dòng ghế"
                                            className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                                                value="ACTIVE"
                                                checked={newRoom.status === 'ACTIVE'}
                                                onChange={() => setNewRoom({...newRoom, status: 'ACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                        ${newRoom.status === 'ACTIVE'
                                                ? 'bg-gray-900 border-gray-900'
                                                : 'bg-white border-gray-300'}`}>
                                                {newRoom.status === 'ACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span>Hoạt động</span>
                                        </label>
                                        <label className="inline-flex items-center relative cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="INACTIVE"
                                                checked={newRoom.status === 'INACTIVE'}
                                                onChange={() => setNewRoom({...newRoom, status: 'INACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center 
                                        ${newRoom.status === 'INACTIVE'
                                                ? 'bg-gray-900 border-gray-900'
                                                : 'bg-white border-gray-300'}`}>
                                                {newRoom.status === 'INACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span>Không hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddRoom}
                                    className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                                    disabled={!newRoom.name || newRoom.seatCount <= 0}
                                >
                                    Thêm phòng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};