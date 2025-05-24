import React, { useEffect, useState, useRef } from "react";
import {
  getUser,
  toggleDeleteUser,
  getListUser,
  getListEmployee,
  deactivateUser,
  restoreUser,
} from "@/services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import EditUserModal from "@/pages/admin/EditUserModal.jsx";
import CreateAccountForEmployeeModal from "@/pages/admin/CreateAccountForEmployeeModal.jsx";
import { Users, UserCircle,CheckCircle, AlertCircle, X } from "lucide-react";
const AccountManagement = () => {
  const [accounts, setAccount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [detailAccount, setDetailAccount] = useState(null);

  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [actionType, setActionType] = useState("delete"); // 'delete' hoặc 'restore'
  const [selectedAccountForAction, setSelectedAccountForAction] =
    useState(null);

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isOpenAddEm, setIsOpenAddEm] = useState(false);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [bulkRestoreModalOpen, setBulkRestoreModalOpen] = useState(false);

  const [viewType, setViewType] = useState("user");
  const [toast, setToast] = useState([]);


  const modalConfirmRef = useRef();
  const modalDetailRef = useRef();
  const modalbulkDeRef = useRef();
  const modalbulkReRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đóng Confirm Modal
      if (
        isConfirmModalOpen &&
        modalConfirmRef.current &&
        !modalConfirmRef.current.contains(event.target)
      ) {
        setConfirmModalOpen(false);
        setSelectedAccountForAction(null);
      }
      if (
        bulkDeleteModalOpen &&
        modalbulkDeRef.current &&
        !modalbulkDeRef.current.contains(event.target)
      ) {
        setBulkDeleteModalOpen(false);
      }
      if (
        bulkRestoreModalOpen &&
        modalbulkReRef.current &&
        !modalbulkReRef.current.contains(event.target)
      ) {
        setBulkRestoreModalOpen(false);
      }

      // Đóng Detail Modal (nếu cần)
      if (
        showDetailModal &&
        modalDetailRef.current &&
        !modalDetailRef.current.contains(event.target)
      ) {
        setShowDetailModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    isConfirmModalOpen,
    bulkDeleteModalOpen,
    showDetailModal,
    bulkRestoreModalOpen,
    isOpenAddEm,
  ]);

  const handleClick = () => {
    setIsOpenAddEm(true);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (viewType === "user") {
          const data = await getListUser(); // Danh sách khách hàng
          setAccount(data);
        } else if (viewType === "employee") {
          const data = await getListEmployee(); // Danh sách nhân viên
          setAccount(data);
        }
        setLoading(false);
      } catch (err) {
        setError("Không thể tải dữ liệu");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [viewType]); // <-- Chạy lại khi viewType thay đổi

  const filteredAccount = accounts.filter((account) =>
    Object.values(account).some((value) =>
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
      const allAccountIds = filteredAccount.map((account) => account.userId);
      setSelectedAccount(allAccountIds);
    } else {
      setSelectedAccount([]);
    }
  };

  const handleSelect = (userId) => {
    setSelectedAccount((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleOpenConfirmModal = (account, action) => {
    setSelectedAccountForAction(account);
    setActionType(action);
    setConfirmModalOpen(true);
  };

  const handleDetailAccount = (account) => {
    setSelectedAccountForAction(account);
    setDetailAccount(account);
    setShowDetailModal(true);
  };

  // const handleToggleDeleteStatus = async (account) => {
  //
  //     if (!account) {
  //         console.warn("Account is null or undefined");
  //         return;
  //     }
  //
  //     const newStatus = !account.isActive;
  //
  //     try {
  //         // const newStatus = !account.isActive;
  //         await toggleDeleteUser(account.userId, newStatus);
  //
  //         setAccount(prevAccounts =>
  //             prevAccounts.map(m =>
  //                 m.userId === account.userId ? {...m, isActive: newStatus} : m
  //             )
  //         );
  //         setConfirmModalOpen(false);
  //         setSelectedAccountForAction(null);
  //         setToast({
  //             account: true,
  //             message: newStatus ? 'Đã khôi phục tài khoản!' : 'Đã khóa tài khoản!',
  //             type: 'success'
  //         });
  //
  //         setTimeout(() => {
  //             setToast({account: false, message: '', type: 'success'});
  //         }, 3000);
  //     } catch (error) {
  //
  //         setToast({
  //             account: true,
  //             message: newStatus ? 'Khôi phục tài khoản thất bại!' : 'Khóa tài khoản thất bại!',
  //             type: 'error'
  //         });
  //         setConfirmModalOpen(false);
  //         console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
  //
  //         setTimeout(() => {
  //             setToast({account: false, message: '', type: 'success'});
  //         }, 3000);
  //     }
  // };
  const handleToggleDeleteStatus = async (account) => {
    if (!account) {
      console.warn("Account is null or undefined");
      return;
    }

    const isCurrentlyActive = account.isActive;

    try {
      if (isCurrentlyActive) {
        // Khóa tài khoản
        await deactivateUser(account.userId);
      } else {
        // Khôi phục tài khoản
        await restoreUser(account.userId);
      }

      // Cập nhật trạng thái trong danh sách
      setAccount((prevAccounts) =>
        prevAccounts.map((m) =>
          m.userId === account.userId
            ? { ...m, isActive: !isCurrentlyActive }
            : m
        )
      );

      setConfirmModalOpen(false);
      setSelectedAccountForAction(null);
      addToast(isCurrentlyActive
              ? "Đã khóa tài khoản!"
              : "Đã khôi phục tài khoản!", "success")
    } catch (error) {
      addToast(isCurrentlyActive
          ? "Khóa tài khoản thất bại!"
          : "Khôi phục tài khoản thất bại!",'error')
      setConfirmModalOpen(false);
      console.error("Lỗi khi cập nhật trạng thái tài khoản:", error);
    }
  };

  const handleBulkDelete = () => {
    if (selectedAccount.length === 0) {
      addToast('Vui lòng chọn ít nhất một tài khoản để khóa','error')
      return;
    }

    // Open a confirmation modal for bulk deletion
    setSelectedAccountIds(selectedAccount); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedAccount.length === 0) {
      addToast("Vui lòng chọn ít nhất một tài khoản để khóa",'error')
      return;
    }

    try {
      // Create an array of promises for each movie update
      const updatePromises = selectedAccount.map((userId) => {
        // Find the movie object
        const movieToUpdate = accounts.find((user) => user.userId === userId);
        if (movieToUpdate) {
          return toggleDeleteUser(userId, false);
        }
        return Promise.resolve();
      });

      // Wait for all promises to complete
      await Promise.all(updatePromises);

      // Update local state to reflect changes
      setAccount((prevAccounts) =>
        prevAccounts.map((user) =>
          selectedAccount.includes(user.userId)
            ? { ...user, isActive: false }
            : user
        )
      );

      // Close modal and show success message
      setBulkDeleteModalOpen(false);
      setSelectedAccount([]); // Clear selection after delete
      addToast(`Đã khóa ${selectedAccount.length} tài khoản thành công!`,'success')
    } catch (error) {
      console.error("Lỗi khi xóa nhiều tài khoản:", error);

      setBulkDeleteModalOpen(false);
      addToast("Khóa tài khoản thất bại!",'error')
    }
  };

  const handleBulkRestore = () => {
    if (selectedAccount.length === 0) {
      addToast('Vui lòng chọn ít nhất một tài khoản để khôi phục','error')
      return;
    }

    // Open a confirmation modal for bulk deletion
    setSelectedAccountIds(selectedAccount); // Store all selected IDs
    setBulkRestoreModalOpen(true);
  };

  const confirmBulkRestore = () => {
    if (selectedAccount.length === 0) {
      addToast('Vui lòng chọn ít nhất một tài khoản để khôi phục','error')
      return;
    }

    // Similar to bulk delete but setting isDelete to false
    const updatePromises = selectedAccount.map((userId) => {
      const accountToUpdate = accounts.find((user) => user.userId === userId);
      if (accountToUpdate) {
        return toggleDeleteUser(userId, true);
      }
      return Promise.resolve();
    });

    Promise.all(updatePromises)
      .then(() => {
        setAccount((prevAccounts) =>
          prevAccounts.map((user) =>
            selectedAccount.includes(user.userId)
              ? { ...user, isActive: true }
              : user
          )
        );

        setBulkRestoreModalOpen(false);
        setSelectedAccount([]);
        addToast(`Đã khôi phục ${selectedAccount.length} tài khoản thành công!`,'success')
      })
      .catch((error) => {
        console.error("Lỗi khi khôi phục nhiều tài khoản:", error);
        setBulkRestoreModalOpen(false);
        addToast('Khôi phục tài khoản thất bại!','error')
      });
  };

  useEffect(() => {
    document.title = "Quản lý tài khoản";
  }, []);

  // const navigate = useNavigate();
  //
  // const handleDetailAccount = (account) => {
  //     navigate(`/admin/accountmanagement/${account.userId}`);
  // };
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
  // const ToastNotification = ({ message, type, account }) => {
  //   if (!account) return null;
  //
  //   const typeStyles = {
  //     success: "bg-green-500",
  //     error: "bg-red-500",
  //   };
  //
  //   return (
  //       <div
  //           className={`fixed top-4 right-4 z-50 px-6 py-3 text-white rounded-lg shadow-lg transition-all duration-500 ${typeStyles[type]}`}
  //           style={{
  //             animation: 'fadeInOut 3s ease-in-out',
  //             opacity: account ? 1 : 0,
  //             transform: account ? 'translateY(0)' : 'translateY(-20px)'
  //           }}
  //       >
  //         <div className="flex items-center">
  //                   <span className="material-icons mr-2">
  //                       {type === 'success' ? 'check_circle' : 'error'}
  //                   </span>
  //           {message}
  //         </div>
  //       </div>
  //   );
  // };

  return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/*<ToastNotification*/}
        {/*    message={toast.message}*/}
        {/*    type={toast.type}*/}
        {/*    account={toast.account}*/}
        {/*/>*/}
        <ToastContainer/>

        <div className="flex h-full">
          {isOpenAddEm && (
              <CreateAccountForEmployeeModal
                  isOpen={isOpenAddEm}
                  onClose={() => setIsOpenAddEm(false)}
              />
          )}

          {/* Main content */}
          <div className="flex-1 p-6 overflow-auto">
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">QUẢN LÝ TÀI KHOẢN</h1>
              <div
                  className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
                <div className="relative w-full md:w-64 group">
                  <input
                      type="text"
                      placeholder="Tìm kiếm tài khoản"
                      className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span
                      className="material-icons absolute left-3 top-2.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                  search
                </span>
                </div>
                <UserInfo className="w-full md:w-auto"/>
              </div>
            </div>
            <div className="w-full max-w-lg mx-auto p-2">
              <div
                  className="flex flex-wrap items-center space-x-4 justify-center mb-8 bg-white p-4 rounded-lg shadow-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                      type="radio"
                      name="viewType"
                      value="user"
                      checked={viewType === 'user'}
                      onChange={() => setViewType('user')}
                      className="hidden"
                  />
                  <span className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                      viewType === 'user' ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
            <UserCircle className="mr-2" size={20}/>
            Khách hàng
          </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                      type="radio"
                      name="viewType"
                      value="employee"
                      checked={viewType === 'employee'}
                      onChange={() => setViewType('employee')}
                      className="hidden"
                  />
                  <span className={`flex items-center px-4 py-2 rounded-full transition-all duration-200 ${
                      viewType === 'employee' ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-gray-500 hover:bg-gray-100'
                  }`}>
            <Users className="mr-2" size={20}/>
            Nhân viên
          </span>
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
              <div>
                {viewType === "employee" ? (
                    <button
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                        onClick={handleClick}
                    >
                      <span className="material-icons mr-1">add</span>
                      Thêm nhân viên
                    </button>
                ) : (
                    <div className="px-4 py-2 invisible">Placeholder</div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2 sm:gap-0">
                <button
                    className={`${
                        selectedAccount.length > 0 ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-gray-400 cursor-not-allowed'
                    } text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                        selectedAccount.length > 0 ? 'hover:-translate-y-1' : ''
                    }`}
                    onClick={handleBulkDelete}
                    disabled={selectedAccount.length === 0}
                >
                  <span className="material-icons mr-1">delete</span>
                  Khóa tài khoản đã chọn ({selectedAccount.length})
                </button>

                <button
                    className={`${
                        selectedAccount.length > 0 ? "bg-green-600" : "bg-gray-400"
                    } text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                        selectedAccount.length > 0 ? 'hover:-translate-y-1' : ''
                    }`}
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
                <div className="text-center py-10">
                  <div
                      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
                  <span className="material-icons text-4xl mb-2">error</span>
                  <p className="text-lg">{error}</p>
                </div>
            ) : filteredAccount.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
                  <span className="material-icons text-5xl text-gray-400 mb-3">account_circle</span>
                  <h3 className="text-xl font-medium text-gray-700 mb-1">Không tìm thấy tài khoản</h3>
                  <p className="text-gray-500">Không có tài khoản nào phù hợp với tiêu chí tìm kiếm</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-3 text-left w-10">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                            checked={
                                selectAll ||
                                (currentAccount.length > 0 &&
                                    currentAccount.every((account) =>
                                        selectedAccount.includes(account.userId)
                                    ))
                            }
                            onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Tên tài
                        khoản
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Họ
                        tên
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Ngày
                        sinh
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Giới
                        tính
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Thao
                        tác
                      </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {currentAccount.map((account) => (
                        <tr
                            key={account.userId}
                            className={`border-b hover:bg-gray-50 transition-all duration-300 ${!account.isActive ? 'bg-red-50' : ''}`}
                        >
                          <td className="p-3">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                checked={selectedAccount.includes(account.userId)}
                                onChange={() => handleSelect(account.userId)}
                            />
                          </td>
                          <td className="pp-3 font-medium text-center text-gray-900">{account.userId}</td>
                          <td className={`p-3 font-medium text-left text-gray-900 ${!account.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                            <div className="flex items-center">
                              {!account.isActive && (
                                  <span className="mr-2 text-red-500 flex items-center">
                                <span className="material-icons text-sm">lock</span>
                            </span>
                              )}
                              <span
                                  className={!account.isActive ? 'line-through' : ''}>{account.username}</span>
                              {!account.isActive && (
                                  <span
                                      className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <span className="material-icons text-xs mr-1">block</span>
                                Đã khóa
                            </span>
                              )}
                            </div>
                          </td>
                          <td className={`p-3 text-left hidden sm:table-cell ${!account.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{account.fullName}</td>
                          <td className={`p-3 text-left hidden sm:table-cell ${!account.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{account.email}</td>
                          <td className={`p-3 text-center hidden sm:table-cell ${!account.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{account.birthday}</td>
                          <td className={`p-3 text-center hidden sm:table-cell ${!account.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{account.gender}</td>
                          <td className="p-3 text-center text-gray-600 hidden sm:table-cell">
                            <div className="flex justify-center space-x-1">
                              <button
                                  onClick={() => handleDetailAccount(account)}
                                  className={`text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors ${!account.isActive ? 'opacity-75' : ''}`}
                                  title="Xem tài khoản"
                              >
                                <span className="material-icons">info</span>
                              </button>

                              {account.isActive ? (
                                  <button
                                      onClick={() => handleOpenConfirmModal(account, 'delete')}
                                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                      title="Khóa tài khoản"
                                  >
                                    <span className="material-icons">lock</span>
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => handleOpenConfirmModal(account, 'restore')}
                                      className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-2 rounded-full transition-colors animate-pulse"
                                      title="Khôi phục phim"
                                  >
                                    <span className="material-icons">lock_open</span>
                                  </button>
                              )}
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}

            {isConfirmModalOpen && selectedAccountForAction && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                  <div
                      ref={modalConfirmRef}
                      className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      {actionType === "delete"
                          ? "Xác nhận khóa"
                          : "Xác nhận khôi phục"}
                    </h2>
                    <p className="mb-6">
                      {actionType === "delete"
                          ? `Bạn có chắc chắn muốn khóa tài khoản "${selectedAccountForAction.userId}" không?`
                          : `Bạn có chắc chắn muốn khôi phục tài khoản "${selectedAccountForAction.userId}" không?`}
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
                              handleToggleDeleteStatus(selectedAccountForAction)
                          }
                          className={`px-4 py-2 rounded-md text-white ${
                              actionType === "delete"
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {actionType === "delete" ? "Khóa" : "Khôi phục"}
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {showDetailModal && selectedAccountForAction && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                  <div
                      ref={modalDetailRef}
                      className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-black-600 mb-6">
                          Chi tiết tài khoản #{selectedAccountForAction.userId}
                        </h2>
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                        >
                          <span className="material-icons">close</span>
                        </button>
                      </div>
                      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Họ và tên
                          </label>
                          <input
                              value={selectedAccountForAction.fullName || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Tên đăng nhập
                          </label>
                          <input
                              value={selectedAccountForAction.username || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Email
                          </label>
                          <input
                              value={selectedAccountForAction.email || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Số điện thoại
                          </label>
                          <input
                              value={selectedAccountForAction.phone || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Giới tính
                          </label>
                          <input
                              value={selectedAccountForAction.gender || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Ngày sinh
                          </label>
                          <input
                              value={selectedAccountForAction.birthday || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-600">Vai trò</label>
                          <input value={selectedAccountForAction.role || ""} disabled
                                 className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"/>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Trạng thái
                          </label>
                          <input
                              value={
                                selectedAccountForAction.isActive
                                    ? "Hoạt động"
                                    : "Không hoạt động"
                              }
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">
                            Ngày tạo
                          </label>
                          <input
                              value={selectedAccountForAction.createdAt || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-600">
                            Địa chỉ
                          </label>
                          <textarea
                              value={selectedAccountForAction.address || ""}
                              disabled
                              className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200 bg-gray-100"
                          />
                        </div>
                      </form>
                      <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowDetailModal(false)}
                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          Hủy
                        </button>

                        {selectedAccountForAction.isActive ? (
                            <button
                                onClick={() => {
                                  setShowDetailModal(false);
                                  handleOpenConfirmModal(
                                      selectedAccountForAction,
                                      "delete"
                                  );
                                }}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                                title="Khóa tài khoản"
                            >
                              Khóa
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                  setShowDetailModal(false);
                                  handleOpenConfirmModal(
                                      selectedAccountForAction,
                                      "restore"
                                  );
                                }}
                                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                                title="Khôi phục tài khoản"
                            >
                              Khôi phục
                            </button>
                        )}
                      </div>
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
                    <h2 className="text-lg font-semibold mb-4">
                      Xác nhận khóa hàng loạt
                    </h2>
                    <p className="mb-6">
                      Bạn có chắc chắn muốn khóa {selectedAccount.length} tài khoản
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
                        Khóa
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {bulkRestoreModalOpen && (
                <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                  <div
                      ref={modalbulkReRef}
                      className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
                  >
                    <h2 className="text-lg font-semibold mb-4">
                      Xác nhận khôi phục hàng loạt
                    </h2>
                    <p className="mb-6">
                      Bạn có chắc chắn muốn khôi phục {selectedAccount.length} tài
                      khoản đã chọn không?
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
                          className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        Khôi phục
                      </button>
                    </div>
                  </div>
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
                          <span
                              className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">...</span>
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
                          <span
                              className="mx-1 px-2 py-1.5 text-sm md:text-base text-gray-500">...</span>
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
      </div>
  );
};

export default AccountManagement;
