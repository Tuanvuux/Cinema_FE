import { useState } from "react";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
const cols = 22;
const vipRows = ["E", "F", "G"];
const bookedSeats = ["F6", "F7", "F8", "K5"];

export default function SeatSelection() {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Chọn ghế</h2>
      <div className="border rounded-lg p-4 inline-block bg-gray-100">
        <div className="text-center font-bold mb-2">MÀN HÌNH</div>
        <div className="grid grid-cols-22 gap-2">
          {rows.map((row) => (
            <div key={row} className="flex gap-2 justify-center">
              {Array.from({ length: cols }, (_, i) => {
                const seat = `${row}${i + 1}`;
                return (
                  <button
                    key={seat}
                    className={`w-10 h-10 text-sm border rounded-md flex items-center justify-center 
                      ${
                        selectedSeats.includes(seat)
                          ? "bg-green-500 text-white"
                          : ""
                      }
                      ${
                        bookedSeats.includes(seat)
                          ? "bg-gray-400 cursor-not-allowed"
                          : ""
                      }
                      ${
                        vipRows.includes(row)
                          ? "border-yellow-500"
                          : "border-gray-500"
                      }
                    `}
                    onClick={() => toggleSeat(seat)}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p>Ghế đã chọn: {selectedSeats.join(", ") || "Chưa có ghế nào"}</p>
      </div>
    </div>
  );
}
