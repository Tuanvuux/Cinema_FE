import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export default function useSeatSocket(showtimeId, onSeatUpdate) {
  const stompClientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      // webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      webSocketFactory: () =>
        new SockJS("https://cinema-be-yaoa.onrender.com/ws"),
      debug: () => {},
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("🟢 WebSocket connected");
        stompClientRef.current = client;

        client.subscribe(`/topic/seats/${showtimeId}`, (message) => {
          const seatStatus = JSON.parse(message.body);
          console.log("📥 Nhận được cập nhật ghế:", seatStatus);
          if (onSeatUpdate) {
            onSeatUpdate(seatStatus);
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
  }, [showtimeId, onSeatUpdate]); // <-- thêm onSeatUpdate vào đây

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
