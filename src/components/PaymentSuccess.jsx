import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPaymentById } from "../services/api";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import QRCode from "qrcode";

const PaymentSuccess = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getPaymentById(orderId);
        setPaymentData(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách vé:", err);
        setError("Không thể tải vé.");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchTickets();
    }
  }, [orderId]);

  const isOwner = user && paymentData && user.userId === paymentData.userId;

  const handleGetTicket = async () => {
    if (!paymentData) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [180, 90], // hoặc "a4", "letter", "legal"
    });

    for (let index = 0; index < paymentData.paymentDetails.length; index++) {
      const ticket = paymentData.paymentDetails[index];
      if (index > 0) doc.addPage();
      doc.setFillColor(255, 253, 208);
      doc.rect(0, 0, 180, 110, "F");

      const qrData = JSON.stringify({
        paymentId: paymentData.paymentId,
        userId: paymentData.userId,
        ticketId: ticket.id,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      doc.addImage(qrCodeDataUrl, "PNG", 130, 10, 40, 40);

      doc.setFontSize(18);
      doc.text("VE XEM PHIM - Rap CineX", 20, 20);
      doc.setFontSize(12);
      doc.text("Dia Chi: 71 Ngu Hanh Son, Son Tra, Da Nang", 20, 30);
      doc.text(`Phim: ${paymentData.movieTitle}`, 20, 45);
      doc.text(`Phong chieu: ${paymentData.roomName}`, 20, 55);
      const [hour, minute] = paymentData.startTime.split(":");
      const dateObj = new Date(paymentData.showDate);
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      doc.text(`Thoi gian: ${hour}:${minute} - ${formattedDate}`, 20, 65);
      doc.text(`Ghe: ${ticket.seatName}`, 20, 75);
    }

    doc.save("ve-xem-phim.pdf");
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  if (!isOwner) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-2xl font-semibold text-red-600">
          Bạn không có quyền xem thông tin này!
        </h1>
        <p className="mt-4">
          Vui lòng kiểm tra lại tài khoản hoặc liên hệ hỗ trợ.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold text-green-600">
        Thanh toán thành công!
      </h1>
      <p className="mt-4">Cảm ơn bạn đã đặt vé.</p>

      <div className="mt-6 text-left max-w-md mx-auto bg-gray-50 p-4 rounded shadow">
        <p>
          <strong>Mã giao dịch:</strong> {paymentData.paymentId}
        </p>
        <p>
          <strong>Phim:</strong> {paymentData.movieTitle}
        </p>
        <p>
          <strong>Phòng:</strong> {paymentData.roomName}
        </p>
        <p>
          <strong>Thời gian:</strong> {paymentData.showDate} lúc{" "}
          {paymentData.startTime}
        </p>
        <p>
          <strong>Số vé:</strong> {paymentData.sumTicket}
        </p>
        <p>
          <strong>Tổng tiền:</strong> {paymentData.sumPrice.toLocaleString()}{" "}
          VND
        </p>
        <p>
          <strong>Ghế:</strong>{" "}
          {paymentData.paymentDetails.map((d) => d.seatName).join(", ")}
        </p>
        <p>
          <strong>Thanh toán bằng:</strong> {paymentData.methodPayment}
        </p>
      </div>

      <button
        type="button"
        onClick={handleGetTicket}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Lấy vé
      </button>
    </div>
  );
};

export default PaymentSuccess;
