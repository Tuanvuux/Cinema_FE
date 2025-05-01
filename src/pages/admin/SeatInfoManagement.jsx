import React, { useState, useEffect } from 'react';
import {getSeatInfo, addSeatInfo, updateSeatInfo, deleteSeatInfo} from "../../services/apiadmin.jsx";
import {Link} from "react-router-dom";

export default function SeatInfoManagement () {
    const [SeatInfos, setSeatInfos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // const [selectedSeatInfo, setSelectedSeatInfo] = useState(null);
    const [newSeatInfo, setNewSeatInfo] = useState({
        id:'',
        name: '',
        price: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSeatInfos, setSelectedSeatInfos] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSeatInfo, setEditingSeatInfo] = useState({ id: '', name: '', price: 0});
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSeatInfoId, setSelectedSeatInfoId] = useState(null);

    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [selectedShowtimeIds, setSelectedSeatInfoIds] = useState([]);

    const handleOpenDeleteModal = (showtimeId) => {
        setSelectedSeatInfoId(showtimeId);
        setDeleteModalOpen(true);
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setSelectedSeatInfoId(null);
    };


    const handleDeleteSeatInfo = async (SeatInfoId) => {
        try {
            await deleteSeatInfo(SeatInfoId);
            setSeatInfos(prevSeatInfo =>
                prevSeatInfo.filter(SeatInfo => SeatInfo.id !== SeatInfoId)
            );
            setToast({
                show: true,
                message: 'Xóa Loại ghế thành công!',
                type: 'success'
            });
            handleCloseModal();
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa Loại ghế  thất bại',
                type: 'error'
            })
            handleCloseModal();
            console.error("Lỗi khi xóa Loại ghế:", error);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        }
    };

    const handleEditSeatInfo = (SeatInfo) => {
        setEditingSeatInfo(SeatInfo);
        // setSelectedSeatInfo(SeatInfo);
        setShowEditModal(true);
    };

    useEffect(() => {
        document.title = 'Quản lý Thông tin ghế';
    }, []);

    const handleSaveEdit = async () => {
        try {
            const updatedSeatInfo = await updateSeatInfo(editingSeatInfo.id, {
                name: editingSeatInfo.name,
                price: editingSeatInfo.price,
            });

            // Cập nhật danh sách Loại ghế mà không cần tải lại trang
            setSeatInfos((prevSeatInfos) =>
                prevSeatInfos.map((SeatInfo) => (SeatInfo.id === updatedSeatInfo.id ? updatedSeatInfo : SeatInfo))
            );
            setToast({
                show: true,
                message: 'Sửa Loại ghế thành công!',
                type: 'success'
            });
            setShowEditModal(false);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Cập nhật Loại ghế thất bại!',
                type: 'error'
            })
            console.error("Lỗi khi cập nhật Loại ghế:", error);
            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        }

        setShowEditModal(false);
        setTimeout(() => {
            setToast({show: false, message: '', type: 'success'});
        }, 3000);
    };

    // Handle select all SeatInfos
    const handleSelectAllSeatInfos = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        if (isChecked) {
            // Select all SeatInfos on the current page
            const allSeatInfoIds = filteredSeatInfos.map(SeatInfo => SeatInfo.id);
            setSelectedSeatInfos(allSeatInfoIds);
        } else {
            // Deselect all SeatInfos
            setSelectedSeatInfos([]);
        }
    };

    // Handle individual SeatInfo selection
    const handleSeatInfoSelect = (SeatInfoId) => {
        setSelectedSeatInfos(prevSelected =>
            prevSelected.includes(SeatInfoId)
                ? prevSelected.filter(id => id !== SeatInfoId)
                : [...prevSelected, SeatInfoId]
        );
    };

    // Add this function to handle bulk deletion
    const handleBulkDelete = () => {
        if (selectedSeatInfos.length === 0) {
            setToast({
                show: true,
                message: 'Vui lòng chọn ít nhất một loại để xóa',
                type: 'error'
            });
            return;
        }

        // Open a confirmation modal for bulk deletion
        setSelectedSeatInfoIds(selectedSeatInfos); // Store all selected IDs
        setBulkDeleteModalOpen(true);
    };

// Add this function to perform the actual bulk deletion
    const confirmBulkDelete = async () => {
        try {
            // Delete each selected showtime
            for (const SeatInfoId of selectedSeatInfos) {
                await deleteSeatInfo(SeatInfoId);
            }

            // Update local state by filtering out deleted showtimes
            setSeatInfos(prevSeatInfos =>
                prevSeatInfos.filter(SeatInfo => !selectedSeatInfos.includes(SeatInfo.id))
            );

            // Clear selection
            setSelectedSeatInfos([]);

            // Show success notification
            setToast({
                show: true,
                message: `Đã xóa ${selectedSeatInfos.length} Loại ghế thành công!`,
                type: 'success'
            });

            setBulkDeleteModalOpen(false);

            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            setToast({
                show: true,
                message: 'Xóa loại ghế thất bại',
                type: 'error'
            });

            setBulkDeleteModalOpen(false);
            console.error("Lỗi khi xóa nhiều Loại ghế chiếu:", error);

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

    // Fetch SeatInfos
    useEffect(() => {
        const fetchSeatInfos = async () => {
            try {
                setLoading(true);
                const data = await getSeatInfo();
                setSeatInfos(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch SeatInfos');
                setLoading(false);
                console.error(err);
            }
        };

        fetchSeatInfos();
    }, []);

    // Handle adding a new SeatInfo
    const handleAddSeatInfo = async () => {
        try {
            const addedSeatInfo = await addSeatInfo(newSeatInfo);
            setSeatInfos([...SeatInfos, addedSeatInfo]);
            // Show success toast
            setToast({
                show: true,
                message: 'Thêm Loại ghế thành công!',
                type: 'success'
            });
            // Reset form and close modal
            setNewSeatInfo({
                name: '',
                price: 0
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
                message: 'Thêm Loại ghế thất bại!',
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


    const filteredSeatInfos = SeatInfos.filter(SeatInfo => {
        const matchesSearch = Object.values(SeatInfo).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchesSearch;
    });


    // Calculate pagination
    const indexOfLastSeatInfo = currentPage * itemsPerPage;
    const indexOfFirstSeatInfo = indexOfLastSeatInfo - itemsPerPage;
    const currentSeatInfos = filteredSeatInfos.slice(indexOfFirstSeatInfo, indexOfLastSeatInfo);
    const totalPages = Math.ceil(filteredSeatInfos.length / itemsPerPage);

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

    const handleInputChangeEdit = (e) => {
        setEditingSeatInfo({ ...editingSeatInfo, [e.target.name]: e.target.value });
    };

    // Handle input change for new SeatInfo form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSeatInfo({
            ...newSeatInfo,
            [name]: value,
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
                        <Link to="/admin/dashboard" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">assessment</span>
                            <span>Báo cáo</span>
                        </Link>
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
                        <Link to="/admin/accountmanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">account_circle</span>
                            <span>Tài khoản</span>
                        </Link>
                        <Link to="/admin/seatmanagement"
                              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">event_seat</span>
                            <span>Ghế ngồi</span>
                        </Link>
                        <Link to="#" className="flex items-center gap-2 py-2 px-3 hover:bg-gray-800 rounded">
                            <span className="material-icons">confirmation_number</span>
                            <span>Quản lý vé đặt</span>
                        </Link>
                    </nav>
                </div>

                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">QUẢN LÝ THÔNG TIN GHẾ</h1>
                        <div className="flex items-center">
                            <div className="relative mr-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm Loại ghế chiếu"
                                    className="border rounded-md py-2 px-4 pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
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
                            Thêm Loại ghế
                        </button>

                        <button
                            className={`${selectedSeatInfos.length > 0 ? 'bg-red-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center`}
                            onClick={handleBulkDelete}
                            disabled={selectedSeatInfos.length === 0}
                        >
                            <span className="material-icons mr-1">delete</span>
                            Xóa Loại ghế lịch chiếu đã chọn ({selectedSeatInfos.length})
                        </button>
                    </div>

                    {/* SeatInfo Table */}
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
                                               checked={selectAll || (currentSeatInfos.length > 0 && currentSeatInfos.every(SeatInfo => currentSeatInfos.includes(SeatInfo.id)))}
                                               onChange={handleSelectAllSeatInfos}
                                        />
                                    </th>
                                    <th className="p-3 text-center">Tên Loại ghế</th>
                                    <th className="p-3 text-center">Giá</th>
                                    <th className="p-3 text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentSeatInfos.map((SeatInfo) => (
                                    <tr key={SeatInfo.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <input type="checkbox" className="form-checkbox h-5 w-5"
                                                   checked={selectedSeatInfos.includes(SeatInfo.id)}
                                                   onChange={() => handleSeatInfoSelect(SeatInfo.id)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-center">{SeatInfo.name}</td>
                                        <td className="p-3 text-center">{SeatInfo.price}</td>

                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleEditSeatInfo(SeatInfo)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleOpenDeleteModal(SeatInfo.id)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">delete</span>
                                            </button>

                                            {isDeleteModalOpen && (
                                                <div
                                                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                                        <h2 className="text-lg font-semibold mb-4">Xác nhận xóa</h2>
                                                        <p className="mb-6">Bạn có chắc chắn muốn xóa loại ghế này
                                                            không?</p>
                                                        <div className="flex justify-end gap-4">
                                                            <button
                                                                onClick={handleCloseModal}
                                                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSeatInfo(SeatInfo.id)}
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

                    {/* Pagination.jsx */}
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

                            {currentPage < totalPages - 2 && totalPages > 5 && (
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
                        <p className="mb-6">Bạn có chắc chắn muốn xóa {selectedSeatInfos.length} Loại ghế chiếu đã chọn
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

            {showEditModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Chỉnh sửa Loại ghế chiếu</h2>
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
                                    Tên Loại ghế
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={editingSeatInfo.name}
                                    onChange={handleInputChangeEdit}
                                    className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá ghế
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={editingSeatInfo.price}
                                    onChange={handleInputChangeEdit}
                                    className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    min="0"
                                    step="0.01"
                                    required
                                />
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
                                disabled={!editingSeatInfo.name || editingSeatInfo.price <= 0}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add SeatInfo Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Thêm Loại ghế mới</h2>
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
                                    Tên Loại ghế
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newSeatInfo.name}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên Loại ghế chiếu"
                                    className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={newSeatInfo.price}
                                    onChange={handleInputChange}
                                    placeholder="Nhập giá ghế"
                                    className="w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                    min="1"
                                    required
                                />
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
                                onClick={handleAddSeatInfo}
                                className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                                disabled={!newSeatInfo.name || newSeatInfo.price <= 0}
                            >
                                Thêm Loại ghế
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};