import { useState } from "react";

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState("metiz");

  const handlePaymentChange = () => {
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
        <h3 className="text-xl font-semibold">Nội Dung Thanh Toán</h3>
        <p>
          <strong>Phim:</strong> (longTieng) Sát Thủ Vô Cùng Cừ
        </p>
        <p>
          <strong>Ngày:</strong> 17/03/2025
        </p>
        <p>
          <strong>Thời gian:</strong> 09:30 - 11:17
        </p>
        <p>
          <strong>Ghế:</strong> I08
        </p>
        <p>
          <strong>Số vé:</strong> 1
        </p>
        <p>
          <strong>Tổng tiền:</strong> 45.000 VNĐ
        </p>
      </div>

      {/* Nút tiếp tục */}
      <div className="mt-6 flex justify-center">
        <button className=" text-gray-900 px-6 py-2 rounded-full border-1 border-gray-900 hover:bg-gray-900 hover:text-white mr-2">
          QUAY LẠI
        </button>
        <button className="text-gray-900 px-6 py-2 rounded-full border-1 border-gray-900 hover:bg-gray-900 hover:text-white ml-2">
          TIẾP TỤC
        </button>
      </div>
    </div>
  );
};

export default Payment;
