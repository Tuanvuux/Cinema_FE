import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShowtime } from "../contexts/ShowtimeContext";
import { getShowtimeById } from "../utils/showtimeUtils";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { seats = [], totalPrice = 0, showtimeId } = location.state || {};

  const { loading, showtimes } = useShowtime();

  const [paymentMethod, setPaymentMethod] = useState("metiz");
  console.log("showtimes", showtimes);
  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes);
  }, [showtimeId, showtimes]);
  const movieName =
    showtime?.movie?.title || showtime?.movie?.name || "Không xác định";
  const date = showtime?.showDate || "??/??/????";
  const time = showtime
    ? `${showtime.startTime} - ${showtime.endTime}`
    : "??:?? - ??:??";
  const seatNames = seats.map((seat) => seat.seatName).join(", ");
  const ticketCount = seats.length;

  const handlePaymentChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg text-black">
      {/* Tiêu đề */}
      <h2 className="text-lg font-semibold text-center bg-gray-400 py-2 rounded-md text-white">
        PHƯƠNG THỨC THANH TOÁN
      </h2>

      {/* Chọn phương thức thanh toán */}
      <div className="flex justify-center space-x-6 mt-4">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="payment"
            value="metiz"
            checked={paymentMethod === "metiz"}
            onChange={handlePaymentChange}
          />
          <span>Thanh toán bằng Ví điện tử</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="payment"
            value="helio"
            checked={paymentMethod === "helio"}
            onChange={handlePaymentChange}
          />
          <span>Thanh toán bằng Paypal</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="payment"
            value="visa"
            checked={paymentMethod === "visa"}
            onChange={handlePaymentChange}
          />
          <span>Thanh toán qua Internet Banking/VISA</span>
        </label>
      </div>

      {/* Thông tin thanh toán */}
      <div className="mt-6 border p-4 rounded-md">
        <h3 className="text-xl font-semibold mb-2">Nội Dung Thanh Toán</h3>
        <p>
          <strong>Phim:</strong> {movieName}
        </p>
        <p>
          <strong>Ngày:</strong> {date}
        </p>
        <p>
          <strong>Thời gian:</strong> {time}
        </p>
        <p>
          <strong>Ghế:</strong> {seatNames}
        </p>
        <p>
          <strong>Số vé:</strong> {ticketCount}
        </p>
        <p>
          <strong>Tổng tiền:</strong> {totalPrice.toLocaleString()} VNĐ
        </p>
      </div>

      {/* Nút tiếp tục */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-900 px-6 py-2 rounded-full border border-gray-900 hover:bg-gray-900 hover:text-white mr-2"
        >
          QUAY LẠI
        </button>
        <button
          onClick={() => alert("Xử lý thanh toán sau")}
          className="text-gray-900 px-6 py-2 rounded-full border border-gray-900 hover:bg-gray-900 hover:text-white ml-2"
        >
          TIẾP TỤC
        </button>
      </div>
    </div>
  );
};

export default Payment;
