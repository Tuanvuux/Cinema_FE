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
export const addMovie = async (movieData) => {
    const response = await api.post("/movies/admin", movieData);
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
    const response = await api.patch(`/movies/admin/${movieId}/toggle-delete`, {
        isDelete: isDelete,
    });
    return response.data;
};

//User
export const getUser = async () => {
    const response = await api.get("/accounts/admin");
    return response.data;
};


export const toggleDeleteUser = async (userId, isActive) => {
    const response = await api.patch(`/accounts/admin/${userId}/toggle-delete`, {
        isActive: isActive,
    });
    return response.data;
};

//Room
export const getRooms = async () => {
    const response = await api.get("/rooms/admin");
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

//Seat
export const getSeats = async () => {
    const response = await api.get("/seats/admin");
    return response.data;
};

export const addSeat = async (seatData) => {
    const response = await api.post("/seats/admin", seatData);
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