import React, { useState, useEffect, useRef } from 'react';
import { getShowtimes, deleteShowtime, getRooms, addShowtime,
    updateShowtime, getReleaseDate,checkShowTimeExists,checkMovieIsDelete,
    checkInActiveRoom} from "../../services/apiadmin.jsx";
import { getMovies } from "../../services/api.jsx";
import { Link } from "react-router-dom";
import { format, addMinutes, isSameDay, isSameMinute } from 'date-fns';
import showtime from "@/components/Showtime.jsx";
import UserInfo from "@/pages/admin/UserInfo.jsx";
import {AlertCircle, CheckCircle, X} from "lucide-react";


export default function ShowtimeManagement() {
    const [Showtime, setShowtime] = useState([]);

    const [movies, setMovies] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showDate, setShowDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [releaseDate, setReleaseDate] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showPastShowtimes, setShowPastShowtimes] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedShowtime, setSelectedShowtime] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    const [editingShowtime, setEditingShowtime] = useState({ showtimeId: '', nameMovie: '', showDate: '', startTime: '', endTime: '', nameRoom: '' });
    const [selectedShowtimeId, setSelectedShowtimeId] = useState(null);

    const [showEditModal, setshowEditModal] = useState(false);
    const [showAddModal, setshowAddModal] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedShowTimeForAction, setSelectedShowTimeForAction] = useState(null);

    const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
    const [selectedShowtimeIds, setSelectedShowtimeIds] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});


    const modalConfirmRef = useRef();
    const modalEditRef = useRef();
    const modalbulkDeRef = useRef();
    const modalAddRef = useRef();

    const [toast, setToast] = useState([]);
    useEffect(() => {
        if (Object.keys(validationErrors).length > 0) {
            const timer = setTimeout(() => {
                setValidationErrors({});
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [validationErrors]);
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
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Đóng Confirm Modal
            if (isDeleteModalOpen && modalConfirmRef.current && !modalConfirmRef.current.contains(event.target)) {
                setDeleteModalOpen(false);
                setSelectedShowTimeForAction(null);
            }
            if (bulkDeleteModalOpen && modalbulkDeRef.current && !modalbulkDeRef.current.contains(event.target)) {
                setBulkDeleteModalOpen(false);
            }

            if (showEditModal && modalEditRef.current && !modalEditRef.current.contains(event.target)) {
                setshowEditModal(false);
                handleCancel();
            }

            if (showAddModal && modalAddRef.current && !modalAddRef.current.contains(event.target)) {
                setshowAddModal(false);
                setValidationErrors({});
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDeleteModalOpen, bulkDeleteModalOpen, showEditModal, showAddModal]);

    useEffect(() => {
        getMovies().then(setMovies);
        getRooms().then(setRooms);
        getShowtimes().then(setShowtime);
        document.title = 'Quản lý lịch chiếu';
    }, []);
    useEffect(() => {
        const fetchReleaseDate = async () => {
            if (selectedMovie) {
                try {
                    const date = await getReleaseDate(selectedMovie);
                    setReleaseDate(new Date(date));
                    console.log("ngày phát hành",setReleaseDate)
                } catch (error) {
                    console.error("Lỗi khi lấy ngày phát hành:", error);
                    setReleaseDate(null);
                }
            }
        };

        fetchReleaseDate();
    }, [selectedMovie]);
    const isPastShowtime = (showDate, startTime) => {
        const now = new Date();

        // Tạo Date object từ showDate và startTime
        const showDateTime = new Date(`${showDate} ${startTime}`);

        return showDateTime < now;
    };
    const handleCancel = () => {
        setSelectedMovie("");
        setShowDate("");
        setStartTime("");
        setEndTime("");
        setSelectedRoom("");
        setshowAddModal(false);
        setValidationErrors({})
        setshowEditModal(false)
    };

    const handleEditShowtime = (showtime) => {
        setEditingShowtime({
            showtimeId: showtime.showtimeId,
            movieId: showtime.movie.movieId,
            showDate: showtime.showDate,
            startTime: showtime.startTime,
            endTime: showtime.endTime,
            roomId: showtime.room.id
        });
        setSelectedShowtimeId(showtime.showtimeId);
        setshowEditModal(true);

        setSelectedMovie(showtime.movie.movieId);
        setSelectedRoom(showtime.room.id);
        setShowDate(showtime.showDate);
        setStartTime(showtime.startTime);
        setEndTime(showtime.endTime);
    };

    const handleInputChangeEdit = (e) => {
        const value = e.target.name === "movieId" ? parseInt(e.target.value) : e.target.value;
        setEditingShowtime({ ...editingShowtime, [e.target.name]: value });

        // Nếu đang thay đổi movieId
        if (e.target.name === "movieId") {
            const movieId = parseInt(e.target.value);

            // Tính lại giờ kết thúc khi chọn phim mới
            if (editingShowtime.startTime && movieId) {
                const movie = movies.find(m => m.movieId === movieId);
                if (movie) {
                    const startDate = new Date(`2023-01-01T${editingShowtime.startTime}`);
                    const endDate = addMinutes(startDate, movie.duration);
                    setEditingShowtime(prev => ({
                        ...prev,
                        movieId: movieId,
                        endTime: format(endDate, 'HH:mm:ss')
                    }));
                }
            }
        }
    };

    const handleStartTimeChange = (e) => {
        const timeValue = e.target.value;
        setStartTime(timeValue + ":00"); // Thêm giây để phù hợp với định dạng "HH:mm:ss"

        if (selectedMovie) {
            // Tìm thông tin phim để lấy duration
            const movie = movies.find(m => m.movieId === selectedMovie);
            if (movie) {
                const duration = movie.duration;

                // Tính thời gian kết thúc bằng cách cộng thời lượng phim vào thời gian bắt đầu
                const startDate = new Date(`2023-01-01T${timeValue}:00`);
                const endDate = addMinutes(startDate, duration);
                const formattedEndTime = format(endDate, 'HH:mm:ss');

                setEndTime(formattedEndTime);
            }
        }
    };

    const validateForm = async () => {
        const errors = {};

        if (!selectedMovie) {
            errors.movie = "Vui lòng chọn phim";
        } else {
            try {
                const isDeleted = await checkMovieIsDelete(selectedMovie);
                if (isDeleted === true){
                    errors.movie = "Phim đã bị khóa";
                }
            } catch (error){
                console.error("Lỗi khi kiểm tra isDelete:", error);
                errors.movie = "Không kiểm tra được trạng thái phim";
            }
        }

        if (!showDate) {
            errors.showDate = "Vui lòng chọn ngày chiếu";
        }

        if (!startTime) {
            errors.startTime = "Vui lòng chọn giờ bắt đầu";
        }

        if (!endTime) {
            errors.endTime = "Vui lòng chọn giờ kết thúc";
        }

        if (!selectedRoom) {
            errors.room = "Vui lòng chọn phòng";
        } else{
            try {
                const isActive = await checkInActiveRoom(selectedRoom);
                if (isActive === true){
                    errors.room = "Phòng đã bị khóa";
                }
            } catch (error){
                console.error("Lỗi khi kiểm tra isActive:", error);
                errors.room = "Không kiểm tra được trạng thái phòng";
            }
        }

        if (showDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(showDate);
            const now = new Date();

            if (selectedDate < today) {
                errors.showDate = "Ngày chiếu không được trong quá khứ";
            }

            if (releaseDate) {
                const release = new Date(releaseDate);
                release.setHours(0, 0, 0, 0);
                if (selectedDate < release) {
                    errors.showDate = "Ngày chiếu không được trước ngày phát hành của phim";
                }
            }

            // ✅ Nếu ngày chiếu là hôm nay, kiểm tra startTime không được trước thời gian hiện tại
            if (
                selectedDate.toDateString() === today.toDateString() &&
                startTime &&
                endTime
            ) {
                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);

                const startDateTime = new Date(showDate);
                startDateTime.setHours(startHour, startMinute, 0, 0);

                const endDateTime = new Date(showDate);
                endDateTime.setHours(endHour, endMinute, 0, 0);

                if (startDateTime < now) {
                    errors.startTime = "Giờ bắt đầu phải lớn hơn thời điểm hiện tại";
                }

                if (endDateTime <= startDateTime) {
                    errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const validateEditForm = async () => {
        const errors = {};
        const { movieId, showDate, startTime, endTime, roomId } = editingShowtime;

        if (!movieId) {
            errors.movie = "Vui lòng chọn phim";
        }else {
            try {
                const isDeleted = await checkMovieIsDelete(movieId);
                if (isDeleted === true){
                    errors.movie = "Phim đã bị khóa";
                }
            } catch (error){
                console.error("Lỗi khi kiểm tra isDelete:", error);
                errors.movie = "Không kiểm tra được trạng thái phim";
            }
        }

        if (!showDate) {
            errors.showDate = "Vui lòng chọn ngày chiếu";
        }

        if (!startTime) {
            errors.startTime = "Vui lòng chọn giờ bắt đầu";
        }

        if (!endTime) {
            errors.endTime = "Vui lòng chọn giờ kết thúc";
        }

        if (!roomId) {
            errors.room = "Vui lòng chọn phòng";
        } else{
            try {
                const isActive = await checkInActiveRoom(roomId);
                if (isActive === true){
                    errors.room = "Phòng đã bị khóa";
                }
            } catch (error){
                console.error("Lỗi khi kiểm tra isActive:", error);
                errors.room = "Không kiểm tra được trạng thái phòng";
            }
        }

        if (showDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const selectedDate = new Date(showDate);
            const now = new Date();

            if (selectedDate < today) {
                errors.showDate = "Ngày chiếu không được trong quá khứ";
            }

            if (
                selectedDate.toDateString() === today.toDateString() &&
                startTime &&
                endTime
            ) {
                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);

                const startDateTime = new Date(showDate);
                startDateTime.setHours(startHour, startMinute, 0, 0);

                const endDateTime = new Date(showDate);
                endDateTime.setHours(endHour, endMinute, 0, 0);

                if (startDateTime < now) {
                    errors.startTime = "Giờ bắt đầu phải lớn hơn thời điểm hiện tại";
                }

                if (endDateTime <= startDateTime) {
                    errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
                }
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };


    const handleSubmit = async () => {
        // Reset errors trước khi validate
        setValidationErrors({});

        // Validate form
        const isValid = await validateForm();
        if (!isValid) {
            return;
        }

        try {
            const formattedStartTime = startTime.includes(":") ?
                (startTime.includes(".") ? startTime :
                    (startTime.split(":").length === 2 ? startTime + ":00" : startTime)) :
                startTime + ":00:00";

            const formattedEndTime = endTime.includes(":") ?
                (endTime.includes(".") ? endTime :
                    (endTime.split(":").length === 2 ? endTime + ":00" : endTime)) :
                endTime + ":00:00";

            const response = await addShowtime({
                movie: { movieId: selectedMovie },
                showDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                room: { id: selectedRoom },
            });

            console.log("Kết quả:", response);

            setshowAddModal(false);
            setSelectedMovie("");
            setShowDate("");
            setStartTime("");
            setEndTime("");
            setSelectedRoom("");
            setValidationErrors({}); // Reset validation errors

            await getShowtimes().then(data => {
                setShowtime(data);
                addToast('Thêm lịch chiếu thành công!','success')
            });

        } catch (error) {
            console.error("Chi tiết lỗi:", error.response?.data || error.message);
            addToast('Có lỗi xảy ra khi thêm lịch chiếu','error')
        }
    };
    const isRoomDisabled = (roomId) => {
        // Nếu không có ngày hoặc giờ bắt đầu hoặc giờ kết thúc được chọn, trả về false
        if (!showDate || !startTime || !endTime) {
            return false;
        }

        return Showtime.some(showtime => {
            // Chỉ xét các lịch chiếu trong cùng một ngày và cùng phòng
            if (showtime.room.id !== roomId || showtime.showDate !== showDate) {
                return false;
            }

            // Chuyển đổi thời gian thành đối tượng Date để dễ so sánh
            const newStartTime = new Date(`2023-01-01T${startTime}`);
            const newEndTime = new Date(`2023-01-01T${endTime}`);
            const existingStartTime = new Date(`2023-01-01T${showtime.startTime}`);
            const existingEndTime = new Date(`2023-01-01T${showtime.endTime}`);

            // Kiểm tra xung đột thời gian
            // Hai lịch chiếu xung đột khi:
            // - lịch mới bắt đầu trước khi lịch cũ kết thúc VÀ
            // - lịch mới kết thúc sau khi lịch cũ bắt đầu
            return newStartTime < existingEndTime && newEndTime > existingStartTime;
        });
    };

    const isRoomDisabledEdit = (roomId) => {
        // Nếu đây là phòng hiện tại của lịch chiếu đang chỉnh sửa, luôn cho phép chọn
        if (roomId === editingShowtime.roomId) {
            return false;
        }

        // Nếu không có đủ thông tin để kiểm tra, trả về false
        if (!editingShowtime.showDate || !editingShowtime.startTime || !editingShowtime.endTime) {
            return false;
        }

        return Showtime.some(showtime => {
            // Bỏ qua chính lịch chiếu đang được chỉnh sửa
            if (showtime.id === editingShowtime.showtimeId) {
                return false;
            }

            // Chỉ xét các lịch chiếu trong cùng ngày và cùng phòng mới
            if (showtime.room.id !== roomId || showtime.showDate !== editingShowtime.showDate) {
                return false;
            }

            // Chuyển đổi thời gian thành đối tượng Date để dễ so sánh
            const newStartTime = new Date(`2023-01-01T${editingShowtime.startTime}`);
            const newEndTime = new Date(`2023-01-01T${editingShowtime.endTime}`);
            const existingStartTime = new Date(`2023-01-01T${showtime.startTime}`);
            const existingEndTime = new Date(`2023-01-01T${showtime.endTime}`);

            // Kiểm tra xung đột thời gian
            return newStartTime < existingEndTime && newEndTime > existingStartTime;
        });
    };

    const handleEditSubmit = async () => {
        setValidationErrors({});

        // Validate form
        const isValid = await validateEditForm();
        if (!isValid) {
            return;
        }

        try {
            const isBooked = await checkShowTimeExists(editingShowtime.showtimeId);
            if (isBooked) {
                addToast("Lịch chiếu đã có vé đặt, không thể chỉnh sửa!", "error");
                setshowEditModal(false);
                return;
            }

            const formattedStartTime = editingShowtime.startTime.includes(":") ?
                (editingShowtime.startTime.includes(".") ? startTime :
                    (editingShowtime.startTime.split(":").length === 2 ? editingShowtime.startTime + ":00" : editingShowtime.startTime)) :
                editingShowtime.startTime + ":00:00";

            const formattedEndTime = editingShowtime.endTime.includes(":") ?
                (editingShowtime.endTime.includes(".") ? editingShowtime.endTime :
                    (editingShowtime.endTime.split(":").length === 2 ? editingShowtime.endTime + ":00" : editingShowtime.endTime)) :
                editingShowtime.endTime + ":00:00";

            const updatedShowtime = await updateShowtime(editingShowtime.showtimeId, {
                movie: {
                    movieId: editingShowtime.movieId,
                    name: selectedMovie.name
                },
                showDate: editingShowtime.showDate,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                room: {
                    id: editingShowtime.roomId,
                    name: selectedRoom.name
                }
            });

            setShowtime((prevShowtime) =>
                prevShowtime.map((showtime) => (showtime.showtimeId === updatedShowtime.showtimeId ? updatedShowtime : showtime))
            );
            addToast('Sửa lịch chiếu thành công!','success')
            setshowEditModal(false);
        } catch (error) {
            addToast('Cập nhật lịch chiếu thất bại!', 'error')
            console.error("Lỗi khi cập nhật lịch chiếu:", error);
        }
        setshowEditModal(false);
    };

    // Handle select all Showtime
    const handleSelectAllShowtime = (e) => {
        const isChecked = e.target.checked;
        setSelectAll(isChecked);
        if (isChecked) {
            const allShowtimeIds = filteredShowtime.map(showtime => showtime.showtimeId);
            setSelectedShowtime(allShowtimeIds);
        } else {
            setSelectedShowtime([]);
        }
    };

    // Handle individual Showtime selection
    const handleShowtimeSelect = (showtimeId) => {
        setSelectedShowtime((prevSelected = []) =>
            prevSelected.includes(showtimeId)
                ? prevSelected.filter(id => id !== showtimeId)
                : [...prevSelected, showtimeId]
        );
    };

    // Add this function to handle bulk deletion
    const handleBulkDelete = () => {
        if (selectedShowtime.length === 0) {
            addToast('Vui lòng chọn ít nhất một lịch chiếu để xóa', 'error')
            return;
        }
        // Open a confirmation modal for bulk deletion
        setSelectedShowtimeIds(selectedShowtime); // Store all selected IDs
        setBulkDeleteModalOpen(true);
    };

    const confirmBulkDelete = async () => {
        try {
            // Delete each selected showtime
            for (const showtimeId of selectedShowtime) {
                await deleteShowtime(showtimeId);
            }

            // Update local state by filtering out deleted showtimes
            setShowtime(prevShowtimes =>
                prevShowtimes.filter(showtime => !selectedShowtime.includes(showtime.showtimeId))
            );

            setSelectedShowtime([]);
            addToast(`Đã xóa ${selectedShowtime.length} lịch chiếu thành công!`, 'success')
            setBulkDeleteModalOpen(false);
        } catch (error) {
            addToast('Xóa lịch chiếu thất bại', 'error')
            setBulkDeleteModalOpen(false);
            console.error("Lỗi khi xóa nhiều lịch chiếu:", error);
        }
    };

    // Fetch Showtime
    useEffect(() => {
        const fetchShowtime = async () => {
            try {
                setLoading(true);
                const data = await getShowtimes();
                setShowtime(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch Showtime');
                setLoading(false);
                console.error(err);
            }
        };

        fetchShowtime();
    }, []);

    const filteredShowtime = Showtime.filter(showtime => {
        const search = searchTerm.toLowerCase();

        const flatValues = [
            ...Object.values(showtime),
            ...Object.values(showtime.movie || {}),
            ...Object.values(showtime.room || {})
        ];

        return flatValues.some(val =>
            val?.toString().toLowerCase().includes(search)
        );
    });

    // Calculate pagination
    const indexOfLastShowtime = currentPage * itemsPerPage;
    const indexOfFirstShowtime = indexOfLastShowtime - itemsPerPage;
    const currentShowtime = filteredShowtime.slice(indexOfFirstShowtime, indexOfLastShowtime);
    const totalPages = Math.ceil(filteredShowtime.length / itemsPerPage);

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

    const handleOpenDeleteModal = (showtime) => {
        setSelectedShowtimeId(showtime.showtimeId);
        setDeleteModalOpen(true);
        setSelectedShowTimeForAction(showtime);
    };

    // Đóng Modal
    const handleCloseModal = () => {
        setDeleteModalOpen(false);
        setSelectedShowtimeId(null);
    };

    const handleDeleteShowtime = async (showtimeId) => {
        try {
            await deleteShowtime(showtimeId);
            setShowtime(prevShowtimes =>
                prevShowtimes.filter(showtime => showtime.showtimeId !== showtimeId)
            );
            addToast('Xóa lịch chiếu thành công!', 'success');
            handleCloseModal();
        } catch (error) {
            addToast('Xóa lịch chiếu thất bại', 'error');
            handleCloseModal();
            console.error("Lỗi khi xóa lịch chiếu:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <ToastContainer/>

            <div className="flex h-full">
                {/* Main content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">QUẢN LÝ LỊCH CHIẾU</h1>
                        <div className="flex flex-col-reverse md:flex-row items-start md:items-center w-full md:w-auto gap-4 mt-4 md:mt-0">
                            <div className="relative w-full md:w-64 group">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm lịch chiếu"
                                    className="border border-gray-300 rounded-lg py-2 px-4 pl-10 w-full transition-all focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="material-icons absolute left-3 top-2.5 text-gray-400 group-hover:text-gray-600 transition-colors duration-300">search</span>
                            </div>
                            <UserInfo className="w-full md:w-auto" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-8">
                        <button
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md hover:bg-gray-800 transition-all duration-300 transform hover:-translate-y-1"
                            onClick={() => setshowAddModal(true)}
                        >
                            <span className="material-icons mr-2">add</span>
                            Thêm lịch chiếu
                        </button>

                        <button
                            className={`px-5 py-2.5 rounded-lg border shadow-md transition-all duration-300 transform hover:-translate-y-1 ${
                                showPastShowtimes
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
                                    : 'bg-white text-gray-800 hover:bg-gray-100 border-gray-300'
                            }`}
                            onClick={() => setShowPastShowtimes(!showPastShowtimes)}
                        >
                            <div className="flex items-center">
                                <span className="material-icons mr-2">{showPastShowtimes ? 'history' : 'calendar_today'}</span>
                                {showPastShowtimes ? 'Xem lịch chiếu hiện tại' : 'Xem lịch chiếu đã qua'}
                            </div>
                        </button>

                        <button
                            className={`${
                                selectedShowtime.length > 0
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                            } text-white px-5 py-2.5 rounded-lg flex items-center shadow-md transition-all duration-300 transform ${
                                selectedShowtime.length > 0 ? 'hover:-translate-y-1' : ''
                            }`}
                            onClick={handleBulkDelete}
                            disabled={selectedShowtime.length === 0}
                        >
                            <span className="material-icons mr-2">delete</span>
                            Xóa lịch chiếu đã chọn
                            {selectedShowtime.length > 0 && <span className="ml-1 bg-white text-red-600 rounded-full px-2 py-0.5 text-xs font-bold">{selectedShowtime.length}</span>}
                        </button>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-lg text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">
                            <span className="material-icons text-4xl mb-2">error</span>
                            <p className="text-lg">{error}</p>
                        </div>
                    ) : filteredShowtime.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg p-6">
                            <span className="material-icons text-5xl text-gray-400 mb-3">calendar_month</span>
                            <h3 className="text-xl font-medium text-gray-700 mb-1">Không tìm thấy lịch chiếu</h3>
                            <p className="text-gray-500">Không có lịch chiếu nào phù hợp với tiêu chí tìm kiếm</p>
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
                                            checked={selectAll || (currentShowtime.length > 0 && currentShowtime.every(showtime => selectedShowtime.includes(showtime.showtimeId)))}
                                            onChange={handleSelectAllShowtime}
                                        />
                                    </th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">ID</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider">Tên phim</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Tên phòng</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Ngày chiếu</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Giờ bắt đầu</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Giờ kết thúc</th>
                                    <th className="p-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider hidden sm:table-cell">Thao tác</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {currentShowtime
                                    .filter(showtime => {
                                        const isPast = isPastShowtime(showtime.showDate, showtime.startTime);
                                        return showPastShowtimes ? isPast : !isPast;
                                    })
                                    .map((Showtime) => {
                                        const isPast = isPastShowtime(Showtime.showDate,Showtime.startTime);
                                        return (
                                            <tr key={Showtime.showtimeId}
                                                className={`border-b transition-colors duration-200 hover:bg-gray-50 ${isPast ? 'opacity-60 cursor-not-allowed' : ''}`}>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox h-5 w-5 text-gray-700 rounded transition-all duration-300"
                                                        checked={selectedShowtime.includes(Showtime.showtimeId)}
                                                        onChange={() => handleShowtimeSelect(Showtime.showtimeId)}
                                                        disabled={isPast}
                                                    />
                                                </td>
                                                <td className="p-3 font-medium text-center text-gray-900">{Showtime.showtimeId}</td>
                                                <td className="p-3 font-medium text-center text-gray-900">{Showtime.movie.name}</td>
                                                <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Showtime.room.name}</td>
                                                <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Showtime.showDate}</td>
                                                <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Showtime.startTime}</td>
                                                <td className="p-3 text-center text-gray-700 hidden sm:table-cell">{Showtime.endTime}</td>
                                                <td className="p-3 text-center text-gray-700 hidden sm:table-cell">
                                                    <div className="flex justify-center space-x-1">
                                                        <button
                                                            onClick={() => handleEditShowtime(Showtime)}
                                                            className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                                                            disabled={isPast}
                                                        >
                                                            <span className="material-icons">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenDeleteModal(Showtime)}
                                                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                                                            disabled={isPast}
                                                        >
                                                            <span className="material-icons">delete</span>
                                                        </button>
                                                    </div>

                                                </td>
                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Modal xác nhận xóa */}
                    {isDeleteModalOpen && selectedShowTimeForAction && (
                        <div
                            className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                            <div ref={modalConfirmRef}
                                 className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-96 mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
                                <h2 className="text-lg font-semibold mb-4">Xác nhận
                                    xóa</h2>
                                <p className="mb-6">Bạn có chắc chắn muốn xóa lịch
                                    chiếu {selectedShowTimeForAction.showtimeId} không?</p>
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShowtime(selectedShowTimeForAction.showtimeId)}
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
                                <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa {selectedShowtime.length} lịch chiếu đã chọn không?</p>
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
                            <div
                                ref={modalAddRef}
                                className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">Thêm lịch chiếu</h2>
                                        <button
                                            onClick={() => setshowAddModal(false)}
                                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                                        >
                                            <span className="material-icons">close</span>
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Tên phim */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                                Tên phim <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    const movieId = parseInt(e.target.value);
                                                    setSelectedMovie(movieId);
                                                    // Clear error khi user chọn
                                                    if (validationErrors.movie) {
                                                        setValidationErrors(prev => ({ ...prev, movie: undefined }));
                                                    }
                                                    if (startTime && movieId) {
                                                        const movie = movies.find(m => m.movieId === movieId);
                                                        if (movie) {
                                                            const startDate = new Date(`2023-01-01T${startTime}`);
                                                            const endDate = addMinutes(startDate, movie.duration);
                                                            setEndTime(format(endDate, 'HH:mm:ss'));
                                                        }
                                                    }
                                                }}
                                                className={`appearance-none w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                                    validationErrors.movie
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
                                                <option value="">Chọn phim</option>
                                                {movies.map(movie => (
                                                    <option key={movie.movieId} value={movie.movieId}>{movie.name}</option>
                                                ))}
                                            </select>
                                            {validationErrors.movie && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.movie}</p>
                                            )}
                                        </div>

                                        {/* Ngày chiếu */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                                Ngày chiếu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                min="1900-01-01"
                                                max="2100-12-31"
                                                onChange={(e) => {
                                                    setShowDate(e.target.value);
                                                    // Clear error khi user nhập
                                                    if (validationErrors.showDate) {
                                                        setValidationErrors(prev => ({ ...prev, showDate: undefined }));
                                                    }
                                                }}
                                                className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                                    validationErrors.showDate
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                                }`}
                                            />
                                            {validationErrors.showDate && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.showDate}</p>
                                            )}
                                        </div>

                                        {/* Giờ bắt đầu */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                                Giờ bắt đầu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                onChange={(e) => {
                                                    handleStartTimeChange(e);
                                                    // Clear error khi user nhập
                                                    if (validationErrors.startTime) {
                                                        setValidationErrors(prev => ({ ...prev, startTime: undefined }));
                                                    }
                                                }}
                                                className={`w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                                    validationErrors.startTime
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                                }`}
                                            />
                                            {validationErrors.startTime && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>
                                            )}
                                        </div>

                                        {/* Giờ kết thúc */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                                Giờ kết thúc <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                readOnly
                                                className="w-full border border-gray-200 bg-gray-100 text-gray-600 rounded-lg py-2.5 px-3.5 shadow-sm"
                                            />
                                        </div>

                                        {/* Chọn phòng */}
                                        <div>
                                            <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                                Chọn phòng <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                onChange={(e) => {
                                                    setSelectedRoom(parseInt(e.target.value));
                                                    // // Clear error khi user chọn
                                                    if (validationErrors.room) {
                                                        setValidationErrors(prev => ({ ...prev, room: undefined }));
                                                    }
                                                }}
                                                className={`appearance-none w-full border rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm ${
                                                    validationErrors.movie
                                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                        : 'border-gray-300 focus:ring-gray-600 focus:border-gray-600'
                                                }`}
                                                // className="appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 0.75rem center',
                                                    backgroundSize: '1.25em'
                                                }}
                                            >
                                                <option value="">Chọn phòng</option>
                                                {rooms.map(room => (
                                                    <option key={room.id} value={room.id} disabled={isRoomDisabled(room.id)}>
                                                        {room.name} {isRoomDisabled(room.id) ? "(Đã có lịch chiếu)" : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            {validationErrors.room && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.room}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-8 gap-3">
                                        <button
                                            onClick={handleCancel}
                                            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            Thêm lịch
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showEditModal && (
                        <div className="fixed inset-0 bg-gray-800/30 flex items-center justify-center z-50">
                            <div ref={modalEditRef} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 opacity-100">
                                <div className="p-6">
                                    <h2 className="text-2xl font-semibold mb-4">Chỉnh sửa lịch chiếu</h2>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Tên phim</label>
                                        <select
                                            name="movieId"
                                            value={editingShowtime.movieId || ""}
                                            onChange={handleInputChangeEdit}
                                            className="appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1.25em'
                                            }}>
                                            <option value="">Chọn phim</option>
                                            {movies.map(movie => (
                                                <option key={movie.movieId} value={movie.movieId}>
                                                    {movie.name}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.movie && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.movie}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Ngày chiếu</label>
                                        <input type="date" value={editingShowtime.showDate} name="showDate"
                                               min="1900-01-01"
                                               max="2100-12-31"
                                               onChange={handleInputChangeEdit}
                                               className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"/>
                                        {validationErrors.showDate && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.showDate}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Giờ bắt
                                            đầu</label>
                                        <input type="time" name="startTime" value={editingShowtime.startTime}
                                               onChange={(e) => {
                                                   const newStartTime = e.target.value;
                                                   // Cập nhật startTime trước
                                                   setEditingShowtime(prevState => ({
                                                       ...prevState,
                                                       startTime: newStartTime
                                                   }));

                                                   // Sau đó tính toán và cập nhật endTime nếu có movieId
                                                   if (newStartTime && editingShowtime.movieId) {
                                                       const movie = movies.find(m => m.movieId === editingShowtime.movieId);
                                                       if (movie) {
                                                           const startDate = new Date(`1970-01-01T${newStartTime}:00`);
                                                           const endDate = addMinutes(startDate, movie.duration);
                                                           const newEndTime = format(endDate, 'HH:mm:ss');

                                                           // Cập nhật lại state với endTime mới
                                                           setEditingShowtime(prevState => ({
                                                               ...prevState,
                                                               startTime: newStartTime,  // đảm bảo startTime được cập nhật
                                                               endTime: newEndTime
                                                           }));
                                                       }
                                                   }
                                               }}
                                               className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"/>
                                        {validationErrors.startTime && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.startTime}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Giờ kết
                                            thúc</label>
                                        <input type="time" name="endTime" value={editingShowtime.endTime} readOnly
                                               className="w-full border border-gray-300 rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 shadow-sm transition-all duration-200"/>

                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-sm font-medium text-gray-700">Chọn
                                            phòng</label>
                                        <select
                                            value={editingShowtime.roomId}
                                            name="roomId"
                                            onChange={(e) => setEditingShowtime({
                                                ...editingShowtime,
                                                roomId: parseInt(e.target.value)
                                            })}
                                            className="appearance-none w-full rounded-lg py-2.5 px-3.5 focus:outline-none focus:ring-2 shadow-sm"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundSize: '1.25em'
                                            }}
                                        >
                                            <option value="">Chọn phòng</option>
                                            {rooms.map(room => (
                                                <option key={room.id} value={room.id}
                                                        disabled={isRoomDisabledEdit(room.id)}>
                                                    {room.name} {isRoomDisabled(room.id) ? "(Đã có lịch chiếu)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {validationErrors.room && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.room}</p>
                                        )}
                                    </div>


                                    <div className="flex justify-end mt-6 gap-3">
                                        <button onClick={handleEditSubmit}
                                                className="px-5 py-2.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-600">Cập
                                            nhật
                                        </button>
                                        <button onClick={handleCancel}
                                                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">Hủy
                                        </button>
                                    </div>
                                </div>
                            </div>
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
        </div>
    );
};