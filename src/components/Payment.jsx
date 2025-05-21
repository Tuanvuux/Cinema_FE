import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useShowtime } from "../contexts/ShowtimeContext";
import { getShowtimeById } from "../utils/showtimeUtils";
import { extendSeatLock, addPayment, paymentMomo } from "../services/api";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seats = [], totalPrice = 0, showtimeId } = location.state || {};
  const { loading, showtimes } = useShowtime();
  const seatIds = seats.map((s) => s.seatId);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;

  const showtime = useMemo(() => {
    return getShowtimeById(showtimeId, showtimes);
  }, [showtimeId, showtimes]);

  useEffect(() => {
    const extend = async () => {
      try {
        const result = await extendSeatLock({
          showtimeId: parseInt(showtimeId, 10),
          userId,
          seatIds,
        });
        console.log("Đã gia hạn giữ ghế:", result);
      } catch (error) {
        console.error("Gia hạn giữ ghế thất bại:", error);
      }
    };

    extend(); // Gọi ngay khi vào trang thanh toán
  }, [showtimeId, userId, seatIds]);

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

  const handlePayment = async () => {
    console.log("handlePayment called");
    try {
      const payment = await createPaymentData();
      console.log("Payment created:", payment);

      if (paymentMethod === "momo") {
        console.log("Calling processMomoPayment");
        await processMomoPayment(payment);
      } else {
        alert("Thanh toán thành công (giả lập)");
      }
    } catch (error) {
      console.error("Thanh toán thất bại", error);
      alert("Thanh toán thất bại!");
    }
  };

  const processMomoPayment = async (payment) => {
    console.log("processMomoPayment called with", payment);
    try {
      const momo = await paymentMomo(payment.sumPrice, payment.paymentId);
      console.log("Phản hồi MoMo:", momo);

      if (momo.payUrl) {
        window.location.href = momo.payUrl;
      } else {
        alert("Không nhận được liên kết thanh toán MoMo.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi thanh toán MoMo:", error);
      alert("Thanh toán MoMo thất bại!");
    }
  };

  const createPaymentData = async () => {
    const payload = {
      sumTicket: seats.length,
      sumPrice: totalPrice,
      methodPayment: paymentMethod,
      userId,
      showtimeId: parseInt(showtimeId, 10),
    };

    try {
      const payment = await addPayment(payload);
      console.log("Tạo payment thành công:", payment);
      return payment;
    } catch (error) {
      console.error("Lỗi khi tạo payment:", error);
      throw error;
    }
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
            value="momo"
            checked={paymentMethod === "momo"}
            onChange={handlePaymentChange}
          />
          <span>Thanh toán bằng Ví điện tử Momo</span>
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
          onClick={handlePayment}
          className="text-gray-900 px-6 py-2 rounded-full border border-gray-900 hover:bg-gray-900 hover:text-white ml-2"
        >
          TIẾP TỤC
        </button>
      </div>
    </div>
  );
};

export default Payment;
