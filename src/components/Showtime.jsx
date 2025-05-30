import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useShowtime } from "../contexts/ShowtimeContext"

const getWeekday = (dateStr) => {
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
  return days[new Date(dateStr).getDay()]
}

const Showtime = () => {
  const [showtime, setShowtime] = useState([])
  const today = new Date()
  const { showtimes, loading } = useShowtime()
  const { movieId } = useParams()
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0])
  const navigate = useNavigate()

  const handleSelectShowtime = (showtimeId) => {
    navigate(`/user/seats/${showtimeId}`)
  }

  useEffect(() => {
    const filtered = movieId ? showtimes.filter((s) => s.movieId == movieId) : showtimes
    setShowtime(filtered)
  }, [movieId, showtimes])

  if (loading) return <div>Đang tải lịch chiếu...</div>

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date.toISOString().split("T")[0]
  })

  const filteredShowtimes = showtime.filter(
      (movie) => Array.isArray(movie.showTimeList) && movie.showTimeList.some((show) => show.showDate === selectedDate),
  )

  const formatTime = (time) => time.slice(0, 5)

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    const weekday = getWeekday(dateStr)

    return { weekday, day, month, year }
  }

  return (
      <div className="p-6 bg-white">
        <h2 className="text-gray-900 text-2xl font-bold mb-4">Lịch chiếu</h2>

        {/* Chọn ngày */}
        <div className=" p-4 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {dates.map((date) => {
              const { weekday, day, month, year } = formatDate(date)
              return (
                  <button
                      key={date}
                      className={`p-2 rounded-lg text-gray-900 flex flex-col items-center border border-gray-900 transition-all duration-300 hover:scale-105 hover:shadow-md ${
                          selectedDate === date ? "bg-gray-900 text-white" : "bg-white"
                      }`}
                      onClick={() => setSelectedDate(date)}
                  >
                    <span>{weekday}</span>
                    <span>{`${day}/${month}/${year}`}</span>
                  </button>
              )
            })}
          </div>
        </div>

        {/* Danh sách phim */}
        <div className="mt-6">
          {loading ? (
              <p className="text-white mt-4">Đang tải lịch chiếu...</p>
          ) : filteredShowtimes.length > 0 ? (
              filteredShowtimes.map((movie, index) => (
                  <div key={index} className="mt-4 flex space-x-4 bg-white rounded-lg p-4">
                    <img
                        src={movie.posterUrl || "/placeholder.svg"}
                        alt={movie.movieName}
                        className="w-24 h-36 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-bold">{movie.movieName}</h4>
                      <div className="mt-2 grid grid-cols-8 gap-2">
                        {Array.isArray(movie.showTimeList) &&
                            movie.showTimeList
                                .filter((show) => show.showDate === selectedDate)
                                .map((show, idx) => (
                                    <button
                                        className="text-gray-900 border border-gray-900 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-gray-50"
                                        key={show.showtimeId}
                                        onClick={() => handleSelectShowtime(show.showtimeId)}
                                    >
                                      <div className="flex flex-col">
                                        <div className="p-1">
                                          {formatTime(show.startTime)} - {formatTime(show.endTime)}
                                        </div>
                                        <div className="border-t border-gray-900 p-1 text-sm">
                                          phòng chiếu:
                                          <br /> {show.room.name}
                                        </div>
                                      </div>
                                    </button>
                                ))}
                      </div>
                    </div>
                  </div>
              ))
          ) : (
              <p className="text-gray-500 mt-2">Ngày bạn chọn hiện không có lịch chiếu nào. Vui lòng chọn ngày khác.</p>
          )}
        </div>
      </div>
  )
}

export default Showtime
