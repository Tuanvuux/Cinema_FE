import React, {useState, useEffect, useRef} from 'react';
import {getRooms, addRoom, updateRoom, deleteRoom} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import {AlertCircle, CheckCircle, X} from "lucide-react";

export default function RoomManagement () {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilter, setShowFilter] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [newRoom, setNewRoom] = useState({
        name: '',
        seatCount: 0,
        status: 'ACTIVE',
        numberOfColumns: 0,
        numberOfRows: 0
    });

    const resetAddModalState = () => {
        setNewRoom({
            name: '',
            seatCount: 0,
            status: 'ACTIVE',
            numberOfColumns: 0,
            numberOfRows: 0
        });
    }
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

    const [toast, setToast] = useState([]);

    const modalEditRef = useRef();
    const modalbulkDeRef = useRef();
    const modalAddRef = useRef();
    const filterRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Đóng Confirm Modal
            if (bulkDeleteModalOpen && modalbulkDeRef.current && !modalbulkDeRef.current.contains(event.target)) {
                setBulkDeleteModalOpen(false);
            }

            if (showEditModal && modalEditRef.current && !modalEditRef.current.contains(event.target)) {
                resetAddModalState();
                setShowEditModal(false);
            }

            if (showAddModal && modalAddRef.current && !modalAddRef.current.contains(event.target)) {
                // resetAddModalState();
                setShowAddModal(false);
            }

            if (showFilter && filterRef.current && !filterRef.current.contains(event.target) &&
                !event.target.closest('button[data-filter-toggle]')) {
                setShowFilter(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [bulkDeleteModalOpen, showEditModal, showAddModal, showFilter]);

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

    const handleOpenDeleteModal = (roomId) => {
        setSelectedRoomId(roomId);
        setDeleteModalOpen(true);
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setSelectedRoomId(null);
    };

    const handleCancel = () => {
        resetAddModalState();
        setErrors({});
        setShowAddModal(false);
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteRoom(roomId);
            setRooms(prevRoom =>
                prevRoom.filter(room => room.id !== roomId)
            );
            addToast('Xóa phòng chiếu thành công!','success')
            handleCloseModal();

        } catch (error) {
            addToast('Xóa phòng chiếu thất bại!','error')
            handleCloseModal();
            console.error("Lỗi khi xóa phòng chiếu:", error);
        }
    };

    const handleEditRoom = (room) => {
        setEditingRoom(room);
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
            addToast('Sửa phòng thành công!','success')
            setShowEditModal(false);

        } catch (error) {
            addToast('Sửa phòng thất bại!','error')
            console.error("Lỗi khi cập nhật phòng:", error);
        }
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
            addToast('Vui lòng chọn ít nhất một phòng chiếu để xóa','error')
            return;
        }

        // Open a confirmation modal for bulk deletion
        setSelectedRoomIds(selectedRooms); // Store all selected IDs
        setBulkDeleteModalOpen(true);
    };

    // Add this function to perform the actual bulk deletion
    const confirmBulkDelete = async () => {
        try {
            // Delete each selected room
            for (const roomId of selectedRooms) {
                await deleteRoom(roomId);
            }

            // Update local state by filtering out deleted rooms
            setRooms(prevRooms =>
                prevRooms.filter(room => !selectedRooms.includes(room.id))
            );

            // Clear selection
            setSelectedRooms([]);
            setSelectAll(false);

            // Show success notification
            addToast(`Đã xóa ${selectedRooms.length} phòng chiếu thành công!`,'success')
            setBulkDeleteModalOpen(false);

        } catch (error) {
            addToast('Xóa phòng chiếu thất bại','error')
            setBulkDeleteModalOpen(false);
            console.error("Lỗi khi xóa nhiều phòng chiếu:", error);
        }
    };

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
        const newErrors = {};
        if (!newRoom.name.trim()) newErrors.name = "Tên phòng là bắt buộc";
        if (!newRoom.seatCount || newRoom.seatCount <= 0) newErrors.seatCount = "Số ghế phải lớn hơn 0";
        if (!newRoom.numberOfColumns || newRoom.numberOfColumns <= 0) newErrors.numberOfColumns = "Số cột phải lớn hơn 0";
        if (!newRoom.numberOfRows || newRoom.numberOfRows <= 0) newErrors.numberOfRows = "Số dòng phải lớn hơn 0";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const addedRoom = await addRoom(newRoom);
            setRooms([...rooms, addedRoom]);
            addToast('Thêm phòng thành công!', 'success');

            setNewRoom({
                name: '',
                seatCount: 0,
                status: 'ACTIVE',
                numberOfColumns: 0,
                numberOfRows: 0
            });
            setErrors({});
            setShowAddModal(false);
        } catch (err) {
            addToast('Thêm phòng thất bại!', 'error');
            console.error(err);
        }
    };


    // Toast Notification Component

    // Handle updating a room's status
    const handleStatusChange = async (roomId, status) => {
        try {
            const roomToUpdate = rooms.find(room => room.id === roomId);
            if (roomToUpdate) {
                const updatedRoom = { ...roomToUpdate, status };
                await updateRoom(roomId, updatedRoom);

                // Update local state
                setRooms(rooms.map(room => room.id === roomId ? { ...room, status } : room));
                addToast(`Trạng thái phòng đã được chuyển thành ${status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}`,'success')
            }
        } catch (err) {
            setError('Failed to update room status');
            addToast('Cập nhật trạng thái thất bại','error')
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
        const { name, value } = e.target;
        const processedValue = name === 'seatCount' || name === 'numberOfColumns' || name === 'numberOfRows'
            ? parseInt(value, 10) || 0
            : value;
        setEditingRoom({ ...editingRoom, [name]: processedValue });
    };

    // Handle input change for new room form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const processedValue = name === 'seatCount' || name === 'numberOfColumns' || name === 'numberOfRows'
            ? parseInt(value, 10) || 0
            : value;
        setNewRoom({
            ...newRoom,
            [name]: processedValue
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: undefined });
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Toast notification */}
            <ToastContainer />
            {/*<ToastNotification*/}
            {/*    message={toast.message}*/}
            {/*    type={toast.type}*/}
            {/*    show={toast.show}*/}
            {/*/>*/}

            <div className="flex h-full">
                {/* Main content */}
                <div className="flex-1 p-4 md:p-6 overflow-auto">
                    {/* Header section */}
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">QUẢN LÝ PHÒNG CHIẾU</h1>
                        <div
                            className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
                            <div className="relative w-full md:w-64 group">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phòng chiếu"
                                    className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span
                                    className="material-icons absolute left-3 top-2 text-gray-400 group-hover:text-gray-600">search</span>
                            </div>
                            <UserInfo className="w-full md:w-auto"/>
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
                                <span className="material-icons text-gray-600">filter_list</span>
                                <span className="ml-2 text-gray-700">Bộ lọc</span>
                            </button>
                            {/* Dropdown filter */}
                            {showFilter && (
                                <div ref={filterRef}
                                     className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 top-14 left-0 w-64 animate-fadeIn">
                                    <h3 className="font-medium text-gray-800 mb-3 border-b pb-2">Lọc theo trạng
                                        thái</h3>
                                    <div className="flex flex-col space-y-3">
                                        <label
                                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="all"
                                                checked={statusFilter === 'all'}
                                                onChange={() => setStatusFilter('all')}
                                                className="mr-2 h-4 w-4 accent-gray-900"
                                            />
                                            <span className="text-gray-700">Tất cả</span>
                                        </label>
                                        <label
                                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={statusFilter === 'active'}
                                                onChange={() => setStatusFilter('active')}
                                                className="mr-2 h-4 w-4 accent-gray-900"
                                            />
                                            <span className="text-gray-700">Hoạt động</span>
                                        </label>
                                        <label
                                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={statusFilter === 'inactive'}
                                                onChange={() => setStatusFilter('inactive')}
                                                className="mr-2 h-4 w-4 accent-gray-900"
                                            />
                                            <span className="text-gray-700">Không hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between mb-6 relative gap-4">
                            <button
                                className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                                onClick={() => setShowAddModal(true)}
                            >
                                <span className="material-icons mr-1">add</span>
                                Thêm phòng
                            </button>

                            <button
                                className={`${selectedRooms.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
                                } text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                                    selectedRooms.length > 0 ? 'hover:-translate-y-1' : ''
                                }`}
                                onClick={handleBulkDelete}
                                disabled={selectedRooms.length === 0}
                            >
                                <span className="material-icons mr-1">delete</span>
                                <span className="hidden sm:inline">Xóa phòng đã chọn</span>
                                <span className="sm:hidden">Xóa đã chọn</span>
                                {selectedRooms.length > 0 && (
                                    <span
                                        className="ml-1 bg-white text-red-600 rounded-full px-2 py-0.5 text-xs font-bold">
                                        {selectedRooms.length}
                                    </span>
                                )}
                            </button>
                    </div>

                    {/* Room Table */}
                    {loading ? (
                        <div className="text-center py-10">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg p-4">
                            <span className="material-icons text-3xl mb-2">error</span>
                            <p>{error}</p>
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
                            <span className="material-icons text-5xl text-gray-400 mb-3">meeting_room</span>
                            <h3 className="text-xl font-medium text-gray-700 mb-1">Không tìm thấy phòng chiếu</h3>
                            <p className="text-gray-500">Không có phòng chiếu nào phù hợp với tiêu chí tìm kiếm</p>
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
                                            checked={selectAll || (currentRooms.length > 0 && selectedRooms.length === currentRooms.length)}
                                            onChange={handleSelectAllRooms}
                                        />
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Tên
                                        phòng
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Sức
                                        chứa
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Số
                                        cột
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Số
                                        hàng
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Trạng
                                        thái
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Thao
                                        tác
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {currentRooms.map((room) => (
                                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                                checked={selectedRooms.includes(room.id)}
                                                onChange={() => handleRoomSelect(room.id)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-center text-gray-900">{room.id}</td>
                                        <td className="p-3 font-medium text-center text-gray-900">{room.name}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{room.seatCount}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{room.numberOfColumns}</td>
                                        <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{room.numberOfRows}</td>
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
                                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900">
                                                    </div>
                                                    <span
                                                        className={`ms-3 text-sm font-medium hidden md:inline-block ${
                                                            room.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                    >
                                                        {room.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                                    </span>

                                                </label>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center space-x-3">
                                                <button
                                                    onClick={() => handleEditRoom(room)}
                                                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <span className="material-icons text-sm">edit</span>
                                                </button>
                                                {/*<button*/}
                                                {/*    onClick={() => handleOpenDeleteModal(room.id)}*/}
                                                {/*    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"*/}
                                                {/*    aria-label="Delete"*/}
                                                {/*>*/}
                                                {/*    <span className="material-icons text-sm">delete</span>*/}
                                                {/*</button>*/}
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

            {/* Bulk Delete Confirmation Modal */}
            {bulkDeleteModalOpen && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div
                        ref={modalbulkDeRef}
                        className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
                    >
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Xác nhận xóa hàng loạt</h2>
                        <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa {selectedRooms.length} phòng chiếu
                            đã chọn
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

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div
                        ref={modalEditRef}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa phòng chiếu</h2>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Tên phòng
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editingRoom.name}
                                        onChange={handleInputChangeEdit}
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="seatCount"
                                           className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Sức chứa (số ghế)
                                    </label>
                                    <input
                                        type="number"
                                        id="seatCount"
                                        name="seatCount"
                                        value={editingRoom.seatCount}
                                        onChange={handleInputChangeEdit}
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfColumns"
                                               className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Số cột ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfColumns"
                                            name="numberOfColumns"
                                            value={editingRoom.numberOfColumns}
                                            onChange={handleInputChangeEdit}
                                            placeholder="Nhập số cột ghế"
                                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfRows"
                                               className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Số hàng ghế
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfRows"
                                            name="numberOfRows"
                                            value={editingRoom.numberOfRows}
                                            onChange={handleInputChangeEdit}
                                            placeholder="Nhập số hàng ghế"
                                            className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Ngày tạo
                                    </label>
                                    <input
                                        type="text"
                                        id="createdAt"
                                        name="createdAt"
                                        value={editingRoom.createdAt}
                                        placeholder="Nhập loại màn hình chiếu"
                                        className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 bg-gray-50 text-gray-500 shadow-sm"
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <div className="flex items-center space-x-6">
                                        <label className="inline-flex items-center relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="ACTIVE"
                                                checked={editingRoom.status === 'ACTIVE'}
                                                onChange={() => setEditingRoom({...editingRoom, status: 'ACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2.5 flex items-center justify-center transition-all duration-200 
                                ${editingRoom.status === 'ACTIVE'
                                                ? 'bg-gray-900 border-gray-900 scale-110'
                                                : 'bg-white border-gray-400 group-hover:border-gray-600'}`}>
                                                {editingRoom.status === 'ACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span className="text-gray-800">Hoạt động</span>
                                        </label>
                                        <label className="inline-flex items-center relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="INACTIVE"
                                                checked={editingRoom.status === 'INACTIVE'}
                                                onChange={() => setEditingRoom({...editingRoom, status: 'INACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2.5 flex items-center justify-center transition-all duration-200
                                ${editingRoom.status === 'INACTIVE'
                                                ? 'bg-gray-900 border-gray-900 scale-110'
                                                : 'bg-white border-gray-400 group-hover:border-gray-600'}`}>
                                                {editingRoom.status === 'INACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span className="text-gray-800">Không hoạt động</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600"
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
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                    <div
                        ref={modalAddRef}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Thêm phòng chiếu mới</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                >
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Tên phòng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newRoom.name}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên phòng chiếu"
                                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 ${errors.name ? 'focus:ring-red-500' : 'focus:ring-gray-600'} focus:border-gray-600 shadow-sm transition-all duration-200`}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="seatCount"
                                           className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Sức chứa (số ghế) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="seatCount"
                                        name="seatCount"
                                        value={newRoom.seatCount}
                                        onChange={handleInputChange}
                                        placeholder="Nhập số lượng ghế"
                                        className={`w-full border ${errors.seatCount ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 ${errors.seatCount ? 'focus:ring-red-500' : 'focus:ring-gray-600'} focus:border-gray-600 shadow-sm transition-all duration-200`}
                                        min="1"
                                        required
                                    />
                                    {errors.seatCount && <p className="text-red-500 text-sm mt-1">{errors.seatCount}</p>}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfColumns"
                                               className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Số cột ghế <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfColumns"
                                            name="numberOfColumns"
                                            value={newRoom.numberOfColumns}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số cột ghế"
                                            className={`w-full border ${errors.numberOfColumns ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 ${errors.numberOfColumns ? 'focus:ring-red-500' : 'focus:ring-gray-600'} focus:border-gray-600 shadow-sm transition-all duration-200`}
                                            required
                                        />
                                        {errors.numberOfColumns && <p className="text-red-500 text-sm mt-1">{errors.numberOfColumns}</p>}
                                    </div>
                                    <div className="w-full sm:w-1/2">
                                        <label htmlFor="numberOfRows"
                                               className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Số hàng ghế <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="numberOfRows"
                                            name="numberOfRows"
                                            value={newRoom.numberOfRows}
                                            onChange={handleInputChange}
                                            placeholder="Nhập số hàng ghế"
                                            className={`w-full border ${errors.numberOfRows ? 'border-red-500' : 'border-gray-300'} rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 ${errors.numberOfRows ? 'focus:ring-red-500' : 'focus:ring-gray-600'} focus:border-gray-600 shadow-sm transition-all duration-200`}
                                            required
                                        />
                                        {errors.numberOfRows && <p className="text-red-500 text-sm mt-1">{errors.numberOfRows}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Trạng thái
                                    </label>
                                    <div className="flex items-center space-x-6">
                                        <label className="inline-flex items-center relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="ACTIVE"
                                                checked={newRoom.status === 'ACTIVE'}
                                                onChange={() => setNewRoom({...newRoom, status: 'ACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2.5 flex items-center justify-center transition-all duration-200 
                                ${newRoom.status === 'ACTIVE'
                                                ? 'bg-gray-900 border-gray-900 scale-110'
                                                : 'bg-white border-gray-400 group-hover:border-gray-600'}`}>
                                                {newRoom.status === 'ACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span className="text-gray-800">Hoạt động</span>
                                        </label>
                                        <label className="inline-flex items-center relative cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="INACTIVE"
                                                checked={newRoom.status === 'INACTIVE'}
                                                onChange={() => setNewRoom({...newRoom, status: 'INACTIVE'})}
                                                className="absolute opacity-0 cursor-pointer"
                                            />
                                            <div className={`w-5 h-5 rounded-full border-2 mr-2.5 flex items-center justify-center transition-all duration-200
                                ${newRoom.status === 'INACTIVE'
                                                ? 'bg-gray-900 border-gray-900 scale-110'
                                                : 'bg-white border-gray-400 group-hover:border-gray-600'}`}>
                                                {newRoom.status === 'INACTIVE' && (
                                                    <span className="text-white text-xs">✓</span>
                                                )}
                                            </div>
                                            <span className="text-gray-800">Không hoạt động</span>
                                        </label>
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
                                    onClick={handleAddRoom}
                                    className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                    //  disabled={!newRoom.name || newRoom.seatCount <= 0}
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