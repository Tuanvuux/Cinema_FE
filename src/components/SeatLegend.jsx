// SeatLegend.js
import React from "react";
import { Info, X } from "lucide-react";

const SeatLegend = () => {
  return (
    <div className="mt-8 bg-gray-50 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <Info className="w-4 h-4 mr-2 text-gray-500" />
        Chú thích
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Ghế thường</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white border-2 border-yellow-400 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Ghế VIP</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white border-2 border-pink-400 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Ghế đôi</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-800 border-2 border-gray-700 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Đã đặt</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-900 border-2 border-gray-500 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Đang chọn</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-300 border-2 border-gray-500 rounded-lg mr-2"></div>
          <span className="text-sm text-gray-600">Đang giữ</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-100 border-2 border-gray-300 rounded-lg mr-2 relative">
            <X className="w-5 h-5 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-sm text-gray-600">Bảo trì</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLegend;
