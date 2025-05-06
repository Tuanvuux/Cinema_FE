import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {getUser, toggleDeleteUser} from "@/services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import NavbarAdmin from "@/components/layout/NavbarAdmin";


const AccountManagement = () => {

    const [accounts, setAccount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [message, setMessage] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [detailAccount, setDetailAccount] = useState(null);

    const [selectedAccountIds, setSelectedAccountIds] = useState([]);
    const [actionType, setActionType] = useState('delete'); // 'delete' hoặc 'restore'
    const [selectedAccountForAction, setSelectedAccountForAction] = useState(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [bulkRestoreModalOpen, setBulkRestoreModalOpen] = useState(false);

    const [editingAccount, setEditingAccount] = useState({
        userId:'',
        username:'',
        fullName:'',
        email:'',
        password:'',
        birthday:'',
        address:'',
        phone:'',
        role:'',
        gender:'',
        isActive: true
    });

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                setLoading(true);
                const data = await getUser();
                setAccount(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch Account');
                setLoading(false);
                console.error(err);
            }
        };

        fetchAccount();
    }, []);
    const [toast, setToast] = useState({
        account: false,
        message: '',
        type: 'success'
    });
    const filteredAccount = accounts.filter(account =>
        Object.values(account).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );


    // Calculate pagination
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentAccount = filteredAccount.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredAccount.length / itemsPerPage);

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
            const allAccountIds = filteredAccount.map(account => account.userId);
            setSelectedAccount(allAccountIds);
        } else {
            setSelectedAccount([]);
        }
    };

    const handleSelect = (userId) => {
        setSelectedAccount(prevSelected =>
            prevSelected.includes(userId)
                ? prevSelected.filter(id => id !== userId)
                : [...prevSelected, userId]
        );
    };

    const handleOpenConfirmModal = (account, action) => {
        setSelectedAccountForAction(account);
        setActionType(action);
        setConfirmModalOpen(true);
    };

    const handleDetailAccount = (account) => {
        setDetailAccount(account);
        setShowDetailModal(true);
    };

    const handleToggleDeleteStatus = async (account) => {

        if (!account) {
            console.warn("Account is null or undefined");
            return;
        }

        const newStatus = !account.isActive;

        try {
            // const newStatus = !account.isActive;
            await toggleDeleteUser(account.userId, newStatus);

            setAccount(prevAccounts =>
                prevAccounts.map(m =>
                    m.userId === account.userId ? {...m, isActive: newStatus} : m
                )
            );
            setConfirmModalOpen(false);
            setSelectedAccountForAction(null);
            setToast({
                account: true,
                message: newStatus ? 'Đã khôi phục tài khoản!' : 'Đã khóa tài khoản!',
                type: 'success'
            });

            setTimeout(() => {
                setToast({account: false, message: '', type: 'success'});
            }, 3000);
        } catch (error) {

            setToast({
                account: true,
                message: newStatus ? 'Khôi phục tài khoản thất bại!' : 'Khóa tài khoản thất bại!',
                type: 'error'
            });
            setConfirmModalOpen(false);
            console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);

            setTimeout(() => {
                setToast({account: false, message: '', type: 'success'});
            }, 3000);
        }
    };

    const handleBulkDelete = () => {
        if (selectedAccount.length === 0) {
            setToast({
                account: true,
                message: 'Vui lòng chọn ít nhất một tài khoản để xóa',
                type: 'error'
            });
            return;
        }

        // Open a confirmation modal for bulk deletion
        setSelectedAccountIds(selectedAccount); // Store all selected IDs
        setBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        if (selectedAccount.length === 0) {
            setToast({
                account: true,
                message: 'Vui lòng chọn ít nhất một tài khoản để xóa',
                type: 'error'
            });
            return;
        }

        try {
            // Create an array of promises for each movie update
            const updatePromises = selectedAccount.map(userId => {
                // Find the movie object
                const movieToUpdate = accounts.find(user => user.userId === userId);
                if (movieToUpdate) {
                    return toggleDeleteUser(userId, false);
                }
                return Promise.resolve();
            });

            // Wait for all promises to complete
            await Promise.all(updatePromises);

            // Update local state to reflect changes
            setAccount(prevAccounts =>
                prevAccounts.map(user =>
                    selectedAccount.includes(user.userId) ? { ...user, isActive: false } : user
                )
            );

            // Close modal and show success message
            setBulkDeleteModalOpen(false);
            setSelectedAccount([]); // Clear selection after delete

            setToast({
                account: true,
                message: `Đã khóa ${selectedAccount.length} tài khoản thành công!`,
                type: 'success'
            });

            setTimeout(() => {
                setToast({ account: false, message: '', type: 'success' });
            }, 3000);
        } catch (error) {
            console.error("Lỗi khi xóa nhiều tài khoản:", error);

            setBulkDeleteModalOpen(false);
            setToast({
                account: true,
                message: 'Xóa tài khoản thất bại!',
                type: 'error'
            });

            setTimeout(() => {
                setToast({ account: false, message: '', type: 'success' });
            }, 3000);
        }
    };

    const handleBulkRestore = () => {
        if (selectedAccount.length === 0) {
            setToast({
                account: true,
                message: 'Vui lòng chọn ít nhất một tài khoản để khôi phục',
                type: 'error'
            });
            return;
        }

        // Open a confirmation modal for bulk deletion
        setSelectedAccountIds(selectedAccount); // Store all selected IDs
        setBulkRestoreModalOpen(true);
    };

    const confirmBulkRestore = () => {
        if (selectedAccount.length === 0) {
            setToast({
                movie: true,
                message: 'Vui lòng chọn ít nhất một tài khoản để khôi phục',
                type: 'error'
            });
            return;
        }

        // Similar to bulk delete but setting isDelete to false
        const updatePromises = selectedAccount.map(userId => {
            const accountToUpdate = accounts.find(user => user.userId === userId);
            if (accountToUpdate) {
                return toggleDeleteUser(userId, true);
            }
            return Promise.resolve();
        });

        Promise.all(updatePromises)
            .then(() => {
                setAccount(prevAccounts =>
                    prevAccounts.map(user =>
                        selectedAccount.includes(user.userId) ? { ...user, isActive: true } : user
                    )
                );

                setBulkRestoreModalOpen(false);
                setSelectedAccount([]);

                setToast({
                    account: true,
                    message: `Đã khôi phục ${selectedAccount.length} tài khoản thành công!`,
                    type: 'success'
                });

                setTimeout(() => {
                    setToast({ account: false, message: '', type: 'success' });
                }, 3000);
            })
            .catch(error => {
                console.error("Lỗi khi khôi phục nhiều tài khoản:", error);
                setBulkRestoreModalOpen(false);
                setToast({
                    account: true,
                    message: 'Khôi phục tài khoản thất bại!',
                    type: 'error'
                });

                setTimeout(() => {
                    setToast({ account: false, message: '', type: 'success' });
                }, 3000);
            });
    };

    useEffect(() => {
        document.title = 'Quản lý tài khoản';
    }, []);

    // const navigate = useNavigate();
    //
    // const handleDetailAccount = (account) => {
    //     navigate(`/admin/accountmanagement/${account.userId}`);
    // };

    const ToastNotification = ({ message, type, account }) => {
        if (!account) return null;

        const typeStyles = {
            success: 'bg-green-500',
            error: 'bg-red-500'
        };

        return (
            <div
                className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-md shadow-lg transition-all duration-300 ${typeStyles[type]}`}
                style={{
                    animation: 'fadeInOut 3s ease-in-out',
                    opacity: account ? 1 : 0
                }}
            >
                {message}
            </div>
        );
    };


    return (
        <div className="flex flex-col h-screen">

            <ToastNotification
                message={toast.message}
                type={toast.type}
                account={toast.account}
            />

            <div className="flex h-full">

                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">QUẢN LÝ TÀI KHOẢN</h1>
                        <div className="flex items-center">
                        <div className="relative mr-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tài khoản"
                                    className="border rounded-md py-2 px-4 pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
                            </div>
                            <UserInfo/>
                        </div>
                    </div>
                    <div className="flex justify-end mb-6">
                        <div className="flex space-x-2">
                            <button
                                className={`${selectedAccount.length >0 ? 'bg-red-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center`}
                                onClick={handleBulkDelete}
                                disabled={selectedAccount.length === 0}
                            >
                                <span className="material-icons mr-1">delete</span>
                                Khóa tài khoản đã chọn ({selectedAccount.length})
                            </button>

                            {/* Optional: Add a bulk restore button */}
                            <button
                                className={`${selectedAccount.length >0 ? 'bg-green-600' : 'bg-gray-400'} text-white px-4 py-2 rounded-md flex items-center`}
                                onClick={handleBulkRestore}
                                disabled={selectedAccount.length === 0}
                            >
                                <span className="material-icons mr-1">restore_from_trash</span>
                                Khôi phục tài khoản đã chọn ({selectedAccount.length})
                            </button>
                        </div>
                    </div>

                    {/*Table*/}
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
                                               checked={selectAll || (currentAccount.length > 0 && currentAccount.every(account => selectedAccount.includes(account.userId)))}
                                               onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 text-left">Tên tài khoản</th>
                                    <th className="p-3 text-left">Họ tên</th>
                                    <th className="p-3 text-left">Email</th>
                                    <th className="p-3 text-center">Ngày sinh</th>
                                    <th className="p-3 text-center">Giới tính</th>
                                    <th className="p-3 text-center">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody>
                                {currentAccount.map((account) => (
                                    <tr key={account.userId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">
                                            <input type="checkbox" className="form-checkbox h-5 w-5"
                                                   checked={selectedAccount.includes(account.userId)}
                                                   onChange={() => handleSelect(account.userId)}
                                            />
                                        </td>
                                        <td className="p-3 font-medium text-left">
                                            {account.username}
                                            {!account.isActive &&
                                                <span className="ml-2 text-xs text-red-500">(đã khóa)</span>}
                                        </td>
                                        <td className="p-3 text-left">{account.fullName}</td>
                                        <td className="p-3 text-left">{account.email}</td>
                                        <td className="p-3 text-center">{account.birthday}</td>
                                        <td className="p-3 text-center">{account.gender}</td>
                                        <td className="p-3 text-center">
                                            <button
                                                onClick={() => handleDetailAccount(account)}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <span className="material-icons">info</span>
                                            </button>

                                            {account.isActive ? (
                                                <button
                                                    onClick={() => handleOpenConfirmModal(account, 'delete')}
                                                    className="text-gray-600 hover:text-red-600"
                                                >
                                                    <span className="material-icons">delete</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenConfirmModal(account, 'restore')}
                                                    className="text-gray-600 hover:text-green-600"
                                                >
                                                    <span className="material-icons">restore_from_trash</span>
                                                </button>
                                            )}

                                            {/* Modal Xác Nhận Xóa/Khôi phục */}
                                            {isConfirmModalOpen && (
                                                <div
                                                    className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                                        <h2 className="text-lg font-semibold mb-4">
                                                            {actionType === 'delete' ? 'Xác nhận xóa' : 'Xác nhận khôi phục'}
                                                        </h2>
                                                        <p className="mb-6">
                                                            {actionType === 'delete'
                                                                ? 'Bạn có chắc chắn muốn khóa tài khoản này không?'
                                                                : 'Bạn có chắc chắn muốn khôi phục tài khoản này không?'
                                                            }
                                                        </p>
                                                        <div className="flex justify-end gap-4">
                                                            <button
                                                                onClick={() => setConfirmModalOpen(false)}
                                                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                            >
                                                                Hủy
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleDeleteStatus(account)}
                                                                className={`px-4 py-2 rounded-md text-white ${
                                                                    actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                                                                }`}
                                                            >
                                                                {actionType === 'delete' ? 'Khóa' : 'Khôi phục'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {showDetailModal && (
                                                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                                                    <div className="p-6 max-w-2xl w-full bg-white rounded-lg shadow-md relative">
                                                        <h2 className="text-2xl font-semibold text-black-600 mb-6">Chi tiết tài khoản</h2>

                                                        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Họ và tên</label>
                                                                <input value={account.fullName || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Tên đăng nhập</label>
                                                                <input value={account.username || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Email</label>
                                                                <input value={account.email || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Số điện thoại</label>
                                                                <input value={account.phone || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Giới tính</label>
                                                                <input value={account.gender || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Ngày sinh</label>
                                                                <input value={account.birthday || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>

                                                            {/*<div>*/}
                                                            {/*    <label className="block text-sm font-medium text-gray-600">Vai trò</label>*/}
                                                            {/*    <input value={account.role || ""} disabled*/}
                                                            {/*           className="w-full p-2 border rounded-md bg-gray-100"/>*/}
                                                            {/*</div>*/}
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Trạng thái</label>
                                                                <input
                                                                    value={account.isActive ? "Hoạt động" : "Không hoạt động"}
                                                                    disabled
                                                                    className="w-full p-2 border rounded-md bg-gray-100"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Ngày tạo</label>
                                                                <input value={account.createdAt || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label
                                                                    className="block text-sm font-medium text-gray-600">Địa chỉ</label>
                                                                <textarea value={account.address || ""} disabled
                                                                       className="w-full p-2 border rounded-md bg-gray-100"/>
                                                            </div>
                                                        </form>

                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setShowDetailModal(false)}
                                                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Hủy
                                                            </button>

                                                            {account.isActive ? (
                                                                <button
                                                                    onClick={() => {
                                                                        setShowDetailModal(false);
                                                                        handleOpenConfirmModal(account, 'delete')}}
                                                                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                                                                    title="Khóa tài khoản"
                                                                >
                                                                    Khóa
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setShowDetailModal(false);
                                                                        handleOpenConfirmModal(account, 'restore')}}
                                                                    className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                                                    title="Khôi phục tài khoản"
                                                                >
                                                                        Khôi phục
                                                                </button>
                                                            )}
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
                        <div
                            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                <h2 className="text-lg font-semibold mb-4">Xác nhận xóa hàng loạt</h2>
                                <p className="mb-6">Bạn có chắc chắn muốn xóa {selectedAccount.length} tài khoản đã chọn
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

                    {bulkRestoreModalOpen && (
                        <div
                            className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                                <h2 className="text-lg font-semibold mb-4">Xác nhận khôi phục hàng loạt</h2>
                                <p className="mb-6">Bạn có chắc chắn muốn khôi phục {selectedAccount.length} tài khoản
                                    đã chọn không?</p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setBulkRestoreModalOpen(false)}
                                        className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={confirmBulkRestore}
                                        className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Khôi phục
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Pagination.jsx */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center">
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
        </div>
    );
};

export default AccountManagement;
