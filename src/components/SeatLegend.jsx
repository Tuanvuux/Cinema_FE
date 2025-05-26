// SeatLegend.js
import React from "react";

const SeatLegend = () => {
  return (
    <div className="my-4">
      <div>Chú thích: </div>
      <div className="flex items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg border-2 border-gray-300"></div>
            <p className="m-0">Ghế thường</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg border-2 border-yellow-300"></div>
            <p className="m-0">Ghế VIP</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg border-2 border-pink-400"></div>
            <p className="m-0">Ghế đôi</p>
          </div>
        </div>

        <div className="space-y-2 ml-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gray-300"></div>
            <span>Ghế Đang giữ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg border-2 bg-blue-900"></div>
            <p className="m-0">Ghế đang chọn</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg border-2 bg-black"></div>
            <p className="m-0">Ghế đã đặt</p>
          </div>
        </div>
        <div className="space-y-2 ml-4">
          <div className="flex items-center space-x-2 relative">
            <div className="w-8 h-8 rounded-lg border border-gray-400 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full relative">
                  <span className="absolute w-[2px] h-full bg-gray-500 rotate-45 left-1/2 top-0 transform -translate-x-1/2" />
                  <span className="absolute w-[2px] h-full bg-gray-500 -rotate-45 left-1/2 top-0 transform -translate-x-1/2" />
                </div>
              </div>
            </div>
            <span>Đang bảo trì</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
