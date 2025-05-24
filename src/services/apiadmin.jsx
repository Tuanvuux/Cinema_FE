import axios from "axios";
import { BASE_URL } from "../constants/constant";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Category
export const addCategory = async (category) => {
  const response = await api.post("/categories", category);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data;
};

//Movie
export const addMovie = async (movieData) => {
  const response = await api.post("/movies/admin", movieData);
  return response.data;
};

export const getSumMovies = async () => {
  const response = await api.get("/movies/admin/countmovie");
  return response.data;
};

export const updateMovie = async (movieId, movieData) => {
  const response = await api.put(`/movies/admin/${movieId}`, movieData);
  return response.data;
};

export const deleteMovie = async (movieId) => {
  const response = await api.delete(`/movies/admin/${movieId}`);
  return response.data;
};

export const toggleDeleteStatus = async (movieId, isDelete) => {
  const response = await api.put(`/movies/admin/${movieId}/toggle-delete`, {
    isDelete: isDelete,
  });
  return response.data;
};

// Deactivate (tạm khóa) tài khoản người dùng
export const deactivateUser = async (userId) => {
  const response = await api.put(`/accounts/admin/${userId}/delete`);
  return response.data;
};

// Restore (kích hoạt lại) tài khoản người dùng
export const restoreUser = async (userId) => {
  const response = await api.put(`/accounts/admin/${userId}/restore`);
  return response.data;
};

//User
export const getUser = async () => {
  const response = await api.get("/accounts/admin");
  return response.data;
};

export const getListUser = async () => {
  const response = await api.get("/accounts/admin/getuser");
  return response.data;
};

export const getListEmployee = async () => {
  const response = await api.get("/accounts/admin/getemployee");
  return response.data;
};

export const getSumUser = async () => {
  const response = await api.get("/accounts/admin/countuser");
  return response.data;
};

export const getSumEmployee = async () => {
  const response = await api.get("/accounts/admin/countemployee");
  return response.data;
};

export const addEmployee = async (request) => {
  const response = await api.post("/auth/admin/create-employee", request);
  return response.data;
};

export const toggleDeleteUser = async (userId, isActive) => {
  const response = await api.put(`/accounts/admin/${userId}/toggle-delete`, {
    isActive: isActive,
  });
  return response.data;
};
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi phản hồi để trả về thông báo chi tiết
    if (error.response) {
      // Có phản hồi từ server với mã lỗi
      return Promise.reject(error);
    } else if (error.request) {
      // Không nhận được phản hồi từ server
      console.error("Không nhận được phản hồi từ máy chủ", error.request);
      return Promise.reject({
        response: {
          data: "Không thể kết nối đến máy chủ",
        },
      });
    } else {
      // Lỗi khi thiết lập request
      console.error("Lỗi cấu hình request", error.message);
      return Promise.reject({
        response: {
          data: "Đã xảy ra lỗi khi gửi yêu cầu",
        },
      });
    }
  }
);

export const getUserByUsername = async (username) => {
  const response = await api.get(`/accounts/admin/${username}`);
  return response.data;
};

export const updateUserAdmin = async (id, userData) => {
  const response = await api.put(`/accounts/admin/${id}`, userData);
  return response.data;
};

//Room
export const getRooms = async () => {
  const response = await api.get("/rooms/admin");
  return response.data;
};

export const getSumRooms = async () => {
  const response = await api.get("/rooms/admin/countroom");
  return response.data;
};

export const addRoom = async (roomData) => {
  const response = await api.post("/rooms/admin", roomData);
  return response.data;
};

export const updateRoom = async (roomId, roomData) => {
  const response = await api.put(`/rooms/admin/${roomId}`, roomData);
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await api.delete(`/rooms/admin/${roomId}`);
  return response.data;
};

// Showtime
export const getShowtimes = async () => {
  const response = await api.get("/showtime/admin");
  return response.data;
};

export const addShowtime = async (ShowtimeData) => {
  const response = await api.post("/showtime/admin", ShowtimeData);
  return response.data;
};

export const updateShowtime = async (ShowtimeId, ShowtimeData) => {
  const response = await api.put(`/showtime/admin/${ShowtimeId}`, ShowtimeData);
  return response.data;
};

export const deleteShowtime = async (showtimeId) => {
  const response = await api.delete(`/showtime/admin/${showtimeId}`);
  return response.data;
};

export const getAvailableRooms = async (showDate, startTime, endTime) => {
  const response = await api.get(`/showtime/admin/availablerooms`, {
    params: {
      showDate,
      startTime,
      endTime,
    },
  });
  return response.data;
};

//Seat
export const getSeats = async () => {
  const response = await api.get("/seats/admin");
  return response.data;
};

export const getSumSeats = async () => {
  const response = await api.get("/seats/admin/countseat");
  return response.data;
};

export const addSeat = async (seatData) => {
  const response = await api.post("/seats/admin", seatData);
  return response.data;
};
export const getSeatInfo = async () => {
  const response = await api.get("/seatinfo/admin");
  return response.data;
};

export const updateSeat = async (seatId, seatData) => {
  const response = await api.put(`/seats/admin/${seatId}`, seatData);
  return response.data;
};

export const deleteSeat = async (seatId) => {
  const response = await api.delete(`/seats/admin/${seatId}`);
  return response.data;
};

//SeatInfo

export const addSeatInfo = async (seatInfoData) => {
  const response = await api.post("/seatinfo/admin", seatInfoData);
  return response.data;
};

export const updateSeatInfo = async (seatInfoId, seatInfoData) => {
  const response = await api.put(`/seatinfo/admin/${seatInfoId}`, seatInfoData);
  return response.data;
};

export const deleteSeatInfo = async (seatInfoId) => {
  const response = await api.delete(`/seatinfo/admin/${seatInfoId}`);
  return response.data;
};

//DashBoard

//By Time
export const getPayments = async () => {
  const response = await api.get("/payments/admin");
  return response.data;
};

export const getPaymentsByDateRange = async (startDate, endDate) => {
  const response = await api.get(`/payments/admin/by-date-range`, {
    params: {
      startDate,
      endDate,
    },
  });
  return response.data;
};

api.interceptors.request.use((request) => {
  console.log("API Request:", request);
  return request;
});

api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response || error);
    return Promise.reject(error);
  }
);

export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await api.get(`/payments/admin/${paymentId}/details`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    throw error;
  }
};

//By Movie
export const getMovieRevenueReport = async (startDate, endDate) => {
  const response = await api.get(`/payments/admin/movies-revenue`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getMovieViewsReport = async (startDate, endDate) => {
  const response = await api.get(`/payments/admin/movies-views`, {
    params: { startDate, endDate },
  });
  return response.data;
};

export const getMovieDetailReport = async (startDate, endDate) => {
  const response = await api.get(`/payments/admin/movies-details`, {
    params: { startDate, endDate },
  });
  return response.data;
};
//Lockseat
export const getLockSeatAdmin = async () => {
  const response = await api.get("/lock-seat-admin/admin");
  return response.data;
};
export const getSeatsByShowtime = async (showtimeId) => {
  const response = await api.get(
    `/lock-seat-admin/admin/getSeatByShowTime/${showtimeId}`
  );
  return response.data;
};

export const getShowTimeByRoom = async (roomId) => {
  const response = await api.get(
    `/lock-seat-admin/admin/getShowTimeByRoom/${roomId}`
  );
  return response.data;
};

export const addLockSeatAdmin = async (seatInfoData) => {
  const response = await api.post("/lock-seat-admin/admin", seatInfoData);
  return response.data;
};

export const deleteLockSeat = async (seatId) => {
  const response = await api.delete(`/lock-seat-admin/admin/${seatId}`);
  return response.data;
};
