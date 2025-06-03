import React, { useState, useEffect, useRef } from "react";
import {deletePost} from "../../services/apiadmin.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import {CheckCircle, AlertCircle, X, Plus} from "lucide-react";
import {getPosts} from "@/services/api.jsx";
import PostForm from "@/components/PostForm.jsx";
import { useNavigate } from "react-router-dom";

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [error, setError] = useState(null);
  // const [selectedSeat, setSelectedSeat] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostForAction, setSelectedPostForAction] = useState(null);
  const [toast, setToast] = useState([]);

  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const navigate = useNavigate();

  const modalConfirmRef = useRef();
  const modalbulkDeRef = useRef();
  const filterRef = useRef();
  const [initialPostData, setInitialPostData] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const previewData = sessionStorage.getItem("previewPost");
    if (previewData) {
      setInitialPostData(JSON.parse(previewData));
      setShowForm(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          isDeleteModalOpen &&
          modalConfirmRef.current &&
          !modalConfirmRef.current.contains(event.target)
      ) {
        setDeleteModalOpen(false);
        setSelectedPostForAction(null);
      }
      if (
          bulkDeleteModalOpen &&
          modalbulkDeRef.current &&
          !modalbulkDeRef.current.contains(event.target)
      ) {
        setBulkDeleteModalOpen(false);
      }

      if (
          showFilter &&
          filterRef.current &&
          !filterRef.current.contains(event.target) &&
          !event.target.closest("button[data-filter-toggle]")
      ) {
        setShowFilter(false);
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
    showFilter,
  ]);

  const handleOpenDeleteModal = (post) => {
    setSelectedPostId(post.id);
    setDeleteModalOpen(true);
    setSelectedPostForAction(post);
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setDeleteModalOpen(false);
    setSelectedPostId(null);
  };

  const handleDeleteSeat = async (PostId) => {
    try {
      await deletePost(PostId);
      setPosts((prevPost) => prevPost.filter((Post) => Post.id !== PostId));
      addToast("Xóa bài viết thành công!", "success");
      handleCloseModal();
    } catch (error) {
      addToast("Xóa bài viết thất bại", "error");
      handleCloseModal();
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  useEffect(() => {
    document.title = "Quản lý bài viết";
    sessionStorage.removeItem("previewEditPost");
    sessionStorage.removeItem("previewPost");
    sessionStorage.removeItem("draftPost");
  }, []);

  // Handle select all Seats
  const handleSelectAllPosts = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      // Select all Seats on the current page
      const allPostIds = filteredPosts.map((Post) => Post.id);
      setSelectedPosts(allPostIds);
    } else {
      // Deselect all Seats
      setSelectedPosts([]);
    }
  };

  // Handle individual Seat selection
  const handlePostSelect = (PostId) => {
    setSelectedPosts((prevSelected) =>
        prevSelected.includes(PostId)
            ? prevSelected.filter((id) => id !== PostId)
            : [...prevSelected, PostId]
    );
  };

  // Add this function to handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) {
      addToast("Vui lòng chọn ít nhất một bài viết để xóa", "error");
      return;
    }
    // Open a confirmation modal for bulk deletion
    setSelectedPostIds(selectedPosts); // Store all selected IDs
    setBulkDeleteModalOpen(true);
  };

  // Add this function to perform the actual bulk deletion
  const confirmBulkDelete = async () => {
    try {
      // Delete each selected showtime
      for (const PostId of selectedPosts) {
        await deletePost(PostId);
      }

      // Update local state by filtering out deleted showtimes
      setPosts((prevPosts) =>
          prevPosts.filter((Post) => !selectedPosts.includes(Post.id))
      );

      // Clear selection
      setSelectedPosts([]);
      addToast(`Đã xóa ${selectedPosts.length} bài viết thành công!`, "success");
      setBulkDeleteModalOpen(false);
    } catch (error) {
      addToast("Xóa bài viết thất bại", "error");
      setBulkDeleteModalOpen(false);
      console.error("Lỗi khi xóa nhiều bài viết:", error);
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPosts();
        console.log("data", data);
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Lấy danh sách bài viết thất bại.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  },[])
  // Handle adding a post Seat
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
  // const filteredPosts = posts.filter((Post) => {
  //   const matchesSearch = Object.values(Post).some((value) =>
  //       value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   const matchesStatus =
  //       statusFilter === "all" || Post.category === statusFilter;
  //   return matchesSearch && matchesStatus
  // });

  const filteredPosts = posts.filter((Post) =>
      Object.values(Post).some((value) =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Calculate pagination
  const indexOfLastPosts = currentPage * itemsPerPage;
  const indexOfFirstPosts = indexOfLastPosts - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPosts, indexOfLastPosts);
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

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
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                QUẢN LÝ BÀI VIẾT
              </h1>
              <div
                  className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
                <div className="relative w-full md:w-64 group">
                  <input
                      type="text"
                      placeholder="Tìm kiếm bài viết"
                      className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                  />
                  <span
                      className="material-icons absolute left-3 top-2 text-gray-400 group-hover:text-gray-600">
                  search
                </span>
                </div>
                <UserInfo className="w-full md:w-auto"/>
              </div>
            </div>
            <div className="flex justify-between mb-6 relative">
              <div className="flex items-center">
                {/* Dropdown filter */}
                {showFilter && (
                    <div ref={filterRef}
                         className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-4 top-14 left-0 w-64 animate-fadeIn">
                      <h3 className="font-medium text-gray-800 mb-3 border-b pb-2">Lọc theo loại bài viết</h3>
                      <div className="flex flex-col space-y-3">
                        <label
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                              type="radio"
                              name="category"
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
                              name="category"
                              value="MOVIE_NEWS"
                              checked={statusFilter === 'MOVIE_NEWS'}
                              onChange={() => setStatusFilter('MOVIE_NEWS')}
                              className="mr-2 h-4 w-4 accent-gray-900"
                          />
                          <span className="text-gray-700">Tin tức phim</span>
                        </label>
                        <label
                            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                          <input
                              type="radio"
                              name="category"
                              value="PROMOTION"
                              checked={statusFilter === 'PROMOTION'}
                              onChange={() => setStatusFilter('PROMOTION')}
                              className="mr-2 h-4 w-4 accent-gray-900"
                          />
                          <span className="text-gray-700">Ưu đãi</span>
                        </label>
                      </div>
                    </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <button
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => {
                      sessionStorage.removeItem("draftPost");
                      navigate("?page=create-post")}}>
                  <span className="material-icons mr-1">add</span>
                  Thêm bài viết
                </button>

              </div>

              <button
                  className={`${
                      selectedPosts.length > 0
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-gray-400 cursor-not-allowed"
                  } 
                            text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                      selectedPosts.length > 0
                          ? "hover:-translate-y-1"
                          : ""
                  }`}
                  onClick={handleBulkDelete}
                  disabled={selectedPosts.length === 0}
              >
                <span className="material-icons mr-1">delete</span>
                <span className="hidden sm:inline">Xóa bài viết đã chọn</span>
                <span className="sm:hidden">Bài viết đã chọn</span>
                {selectedPosts.length > 0 && (
                    <span
                        className="ml-1 bg-white text-red-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {selectedPosts.length}
                </span>
                )}
              </button>
            </div>

            {/* Seat Table */}
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
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
              <span className="material-icons text-5xl text-gray-400 mb-3">
                feed
              </span>
                  <h3 className="text-xl font-medium text-gray-700 mb-1">
                    Không tìm thấy bài viết
                  </h3>
                  <p className="text-gray-500">
                    Không có bài viết nào phù hợp với tiêu chí tìm kiếm
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
                                (currentPosts.length > 0 &&
                                    currentPosts.every((Post) =>
                                        selectedPosts.includes(Post.id)
                                    ))
                            }
                            onChange={handleSelectAllPosts}
                        />
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="p-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Tiêu đề
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                        Ngày tạo
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">
                        Ngày cập nhật
                      </th>
                      <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {currentPosts.map((Post) => (
                        <tr
                            key={Post.id}
                            className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                checked={selectedPosts.includes(Post.id)}
                                onChange={() => handlePostSelect(Post.id)}
                            />
                          </td>
                          <td className="p-3 font-medium text-center text-gray-900">
                            {Post.id}
                          </td>
                          <td className="p-3 font-medium text-left text-gray-900">
                            {Post.title}
                          </td>
                          <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                            {Post.createdAt
                                ? new Date(Post.createdAt).toLocaleDateString()
                                : ""}
                          </td>
                          <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                            {Post.updatedAt
                                ? new Date(Post.updatedAt).toLocaleDateString()
                                : ""}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center space-x-1">
                              <button
                                  className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                                  onClick={()=>{navigate(`?page=post-edit&postId=${Post.id}`)}}
                              >
                                <span className="material-icons">edit</span>
                              </button>
                              <button
                                  onClick={() => handleOpenDeleteModal(Post)}
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

        {isDeleteModalOpen && selectedPostForAction && (
            <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
              <div
                  ref={modalConfirmRef}
                  className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  Xác nhận xóa
                </h2>
                <p className="mb-6 text-gray-600">
                  Bạn có chắc chắn muốn xóa bài viết {selectedPostForAction.id}{" "}
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
                      onClick={() => handleDeleteSeat(selectedPostForAction.id)}
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
                  Bạn có chắc chắn muốn xóa {selectedPosts.length} bài viết đã chọn
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

      </div>

  );
}
