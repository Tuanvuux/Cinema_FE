import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BASE_URL } from "../constants/constant";

export default function useSeatSocket(showtimeId, onSeatUpdate) {
  const stompClientRef = useRef(null);
  const onSeatUpdateRef = useRef(onSeatUpdate);

  // Luôn cập nhật ref nếu onSeatUpdate thay đổi
  useEffect(() => {
    onSeatUpdateRef.current = onSeatUpdate;
  }, [onSeatUpdate]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("🟢 WebSocket connected");
        stompClientRef.current = client;

        client.subscribe(`/topic/seats/${showtimeId}`, (message) => {
          const seatStatus = JSON.parse(message.body);
          console.log("📥 Nhận được cập nhật ghế:", seatStatus);
          if (onSeatUpdateRef.current) {
            onSeatUpdateRef.current(seatStatus); // dùng ref, tránh tạo lại hàm
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate().then(() => {
          console.log("🔴 WebSocket disconnected");
        });
      }
    };
  }, [showtimeId]); // ✅ chỉ phụ thuộc showtimeId

  const sendSeatAction = (seatId, action, userId) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const message = {
        seatId: seatId,
        showtimeId: Number(showtimeId),
        seatStatus: action,
        userId: userId,
      };

      stompClientRef.current.publish({
        destination: `/app/seat/${action === "SELECT" ? "select" : "release"}`,
        body: JSON.stringify(message),
      });

      console.log("📤 Gửi dữ liệu:", message);
    } else {
      console.warn("⚠️ WebSocket chưa sẵn sàng.");
    }
  };

  return {
    sendSeatAction,
  };
}
