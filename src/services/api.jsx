import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
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
export const getMovieById = async (movieId) => {
  const response = await api.get(`/movies/${movieId}`);
  return response.data;
};

export const addMovie = async (movieData) => {
  const response = await api.post("/movies", movieData);
  return response.data;
};
export const getMovies = async () => {
  const response = await api.get("/movies");
  return response.data;
};
//User
export const registerAccount = async (formData) => {
  const response = await api.post("/register", formData);
  return response.data;
};
export const loginApi = async ({ username, password }) => {
  const response = await api.post("api/auth/login", {
    username,
    password,
  });
  return response.data;
};

export const getUser = async () => {
  const response = await api.get("/accounts");
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/accounts/${userId}`);
  return response.data;
};

export const toggleDeleteUser = async (userId, isActive) => {
  const response = await api.patch(`/accounts/${userId}/toggle-delete`, {
    isActive: isActive,
  });
  return response.data;
};

export const updateMovie = async (movieId, movieData) => {
  const response = await api.put(`/movies/${movieId}`, movieData);
  return response.data;
};

export const deleteMovie = async (movieId) => {
  const response = await api.delete(`/movies/${movieId}`);
  return response.data;
};

export const toggleDeleteStatus = async (movieId, isDelete) => {
  const response = await api.patch(`/movies/${movieId}/toggle-delete`, {
    isDelete: isDelete,
  });
  return response.data;
};

// Room
export const getRooms = async () => {
  const response = await api.get("/rooms");
  return response.data;
};

export const addRoom = async (roomData) => {
  const response = await api.post("/rooms", roomData);
  return response.data;
};

export const updateRoom = async (roomId, roomData) => {
  const response = await api.put(`/rooms/${roomId}`, roomData);
  return response.data;
};

export const deleteRoom = async (roomId) => {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data;
};

export const getRoomByRoomId = async (roomId) => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

// Showtime
//admin
export const getShowtimes = async () => {
  const response = await api.get("/showtime/all");
  return response.data;
};
//user
export const getShowtime = async () => {
  const response = await api.get("/showtime");
  return response.data;
};

export const addShowtime = async (ShowtimeData) => {
  const response = await api.post("/showtime", ShowtimeData);
  return response.data;
};

export const updateShowtime = async (ShowtimeId, ShowtimeData) => {
  const response = await api.put(`/showtime/${ShowtimeId}`, ShowtimeData);
  return response.data;
};

export const deleteShowtime = async (showtimeId) => {
  const response = await api.delete(`/showtime/${showtimeId}`);
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

//Seat
export const getSeats = async () => {
  const response = await api.get("/seats");
  return response.data;
};

export const addSeat = async (seatData) => {
  const response = await api.post("/seats", seatData);
  return response.data;
};

export const updateSeat = async (seatId, seatData) => {
  const response = await api.put(`/seats/${seatId}`, seatData);
  return response.data;
};

export const deleteSeat = async (seatId) => {
  const response = await api.delete(`/seats/${seatId}`);
  return response.data;
};
