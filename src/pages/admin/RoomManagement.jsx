import React, { useState, useEffect } from 'react';
import {getRooms, addRoom, updateRoom, deleteRoom} from "../../services/api.jsx";
import {Link} from "react-router-dom";

export default function RoomManagement () {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [selectedRoom, setSelectedRoom] = useState(null);
    const [newRoom, setNewRoom] = useState({
        name: '',
        seatCount: 0,
        status: 'ACTIVE'
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState([]);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState({ id: '', name: '', seatCount: '', status: '' });
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
                setToast({ show: false, message: '', type: 'success' });
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
        if (isChecked) {
            // Select all rooms on the current page
            const currentPageRoomIds = currentRooms.map(room => room.id);
            setSelectedRooms(currentPageRoomIds);
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


    // Filter rooms based on search term and status
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
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
                <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
                    <h1 className="text-2xl font-bold mb-4 ">
                        <Link to="/">Cinema Booking</Link>
                    </h1>

                    <nav className="space-y-4 flex-grow">
                        <Link to="/admin/roommanagement" className="flex items-center gap-2 py-2 px-3 bg-gray-800 rounded">
                            <span className="material-icons">meeting_room</span>
                            <span>Phòng chiếu</span>
                        </Link>
                        <Link to="/admin/showtimemanagement" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">calendar_month</span>
                            <span>Lịch chiếu</span>
                        </Link>
                        <Link to="/admin/moviemanagement" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">movie</span>
                            <span>Phim</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">confirmation_number</span>
                            <span>Quản lý vé đặt</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">assessment</span>
                            <span>Báo cáo</span>
                        </Link>
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">QUẢN LÝ PHÒNG CHIẾU</h1>
                        <div className="flex items-center">
                            <div className="relative mr-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phòng chiếu"
                                    className="border rounded-md py-2 px-4 pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 flex items-center">
                                    <span className="font-medium mr-2">ADMIN</span>
                                    <img src="/avatar.png" alt="Admin Avatar"
                                         className="h-8 w-8 rounded-full bg-gray-300"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Add Button */}
                    <div className="flex justify-between mb-6">
                        <div className="flex items-center">
                            <button className="mr-2 p-2 border rounded hover:bg-gray-100">
                                <span className="material-icons">filter_list</span>
                            </button>
                            <div className="flex space-x-2">
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

                    </div>
                    <div className="flex justify-between mb-6">
                        <button
                            className="bg-gray-900 text-white px-4 py-2 rounded-md flex items-center"
                            onClick={() => setShowAddModal(true)}
                        >
                            <span className="material-icons mr-1">add</span>
                            Thêm phòng
                        </button>

                        <button
                            className={`${selectedRooms.length > 0 ? 'bg-red-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center`}
                            onClick={handleBulkDelete}
                            disabled={selectedRooms.length === 0}
                        >
                            <span className="material-icons mr-1">delete</span>
                            Xóa phòng lịch chiếu đã chọn ({selectedRooms.length})
                        </button>
                    </div>

                    {/* Room Table */}
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
                                        <input type="checkbox" className="form-checkbox h-5 w-5"
                                               checked={selectedRooms.length === currentRooms.length && currentRooms.length > 0}
                                               onChange={handleSelectAllRooms}
                                        />
                                    </th>
                                    <th className="p-3 text-center">Tên phòng</th>
                                    <th className="p-3 text-center">Sức chứa</th>
                                    <th className="p-3 text-center">Trạng thái</th>
                                    <th className="p-3 text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentRooms.map((room) => (
                                    <tr key={room.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <input type="checkbox" className="form-checkbox h-5 w-5"
                                                   checked={selectedRooms.includes(room.id)}
                                                   onChange={() => handleRoomSelect(room.id)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-center">{room.name}</td>
                                        <td className="p-3 text-center">{room.seatCount}</td>
                                        <td className="p-3 text-center">
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
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleEditRoom(room)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteModal(room.id)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>

                                            {isDeleteModalOpen && (
                                                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                                                        <p className="mb-6">Bạn có chắc chắn muốn xóa lịch chiếu này không?</p>
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
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
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

                            {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                const pageNumber = i + 1;
                                return (
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
                                );
                            })}

                            {totalPages > 5 && (
                                <span className="mx-1 px-3 py-1">...</span>
                            )}

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="mx-1 px-3 py-1 rounded border disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteModalOpen && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa hàng loạt</h2>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa {selectedRooms.length} phòng chiếu đã chọn không?</p>
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
            
            {showEditModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
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
                                            onChange={() => setEditingRoom({ ...editingRoom, status: 'ACTIVE' })}
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
                                            onChange={() => setEditingRoom({ ...editingRoom, status: 'INACTIVE' })}
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
            )}
            
            {/* Add Room Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
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
            )}
            
        </div>
    );
};