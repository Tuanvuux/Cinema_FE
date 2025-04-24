export const getShowtimeById = (showtimeId, showtimes) => {
  for (const movie of showtimes) {
    const showtime = movie.showTimeList.find(
      (show) => Number(show.showtimeId) === Number(showtimeId)
    );
    if (showtime) return showtime;
  }
  return null;
};
