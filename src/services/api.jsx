import axios from "axios";
import { BASE_URL } from "../constants/constant";
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//Movie
export const getMovieById = async (movieId) => {
  const response = await api.get(`/movies/${movieId}`);
  return response.data;
};

//admin and user
export const getMovies = async () => {
  const response = await api.get("/movies");
  return response.data;
};

//User
export const registerAccount = async (formData) => {
  const response = await api.post("/auth/register", formData);
  return response.data;
};
export const loginApi = async ({ username, password }) => {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/accounts/${userId}`);
  return response.data;
};

// Room
export const getRoomByRoomId = async (roomId) => {
  const response = await api.get(`/rooms/admin/${roomId}`);
  return response.data;
};

// Showtime
export const getShowtime = async () => {
  const response = await api.get("/showtime");
  return response.data;
};

//Seat
export const getSeatsByRoomId = async (roomId) => {
  const response = await api.get(`/seats/${roomId}`);
  return response.data;
};
export const getRoomById = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};
//GET SEATS LOCK
export const getSeatsLock = async (showtimeId) => {
  const response = await api.get(`/seats/with-lock/${showtimeId}`);
  return response.data;
};
export const verifyAccount = async (data) => {
  const response = await api.post(`/auth/verify`, data);
  return response.data;
};

export const getBookedSeat = async (showtimeId) => {
  const response = await api.get(`/booked/${showtimeId}`);
  return response.data;
};
export const getLockedSeat = async (showtimeId) => {
  const response = await api.get(`/locked/${showtimeId}`);
  return response.data;
};
export const getUserInfo = async (userId) => {
  const response = await api.get("/user/userInfo", {
    params: { userId },
  });
  return response.data;
};

export const updateUserInfo = async (userId, data) => {
  const response = await api.put(`/user/userInfo/${userId}`, data);
  return response.data;
};
export const extendSeatLock = async ({
  showtimeId,
  userId,
  seatIds,
  extendTime,
}) => {
  const response = await api.post("/seats/extend-lock", {
    showtimeId,
    userId,
    seatIds,
    extendTime,
  });
  return response.data;
};

//payment

export const addPayment = async (data) => {
  const response = await api.post(`/payments/addPayment`, data);
  return response.data;
};

export const paymentMomo = async (amount, orderId) => {
  const response = await api.post(
    `api/payment/momo?amount=${amount}&orderId=${orderId}`
  );
  return response.data;
};

export const getPaymentById = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`);
  return response.data;
};

export const getMaintenanceSeat = async (showtimeId) => {
  const response = await api.get(`/seats/maintenance/${showtimeId}`);
  return response.data;
};

export const sendForgotPasswordEmail = async (email) => {
  const response = api.post("/auth/forgot-password", { email });
  return response.data;
};
export const resetPasswordApi = async (token, newPassword) => {
  const response = api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
};
export const changePasswordApi = async (userId, oldPassword, newPassword) => {
  const response = await api.post("/auth/change-password", {
    userId,
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get("/posts");
  return response.data;
};


