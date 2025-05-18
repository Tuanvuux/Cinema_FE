import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default function useSeatSocket(showtimeId, onSeatUpdate) {
  const stompClientRef = useRef(null);

  useEffect(() => {
    // const socket = new SockJS("http://localhost:8080/ws");
    const socket = new SockJS("https://cinema-be-yaoa.onrender.com/ws");

    const stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
      console.log("🟢 WebSocket connected");
      stompClientRef.current = stompClient;

      stompClient.subscribe(`/topic/seats/${showtimeId}`, (message) => {
        const seatStatus = JSON.parse(message.body);
        console.log("📥 Nhận được cập nhật ghế:", seatStatus);
        if (onSeatUpdate) {
          onSeatUpdate(seatStatus); // Cập nhật UI
        }
      });
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect(() => {
          console.log("🔴 WebSocket disconnected");
        });
      }
    };
  }, [showtimeId]);

  const sendSeatAction = (seatId, action, userId) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const message = {
        seatId: seatId,
        showtimeId: Number(showtimeId),
        seatStatus: action,
        userId: userId,
      };

      stompClientRef.current.send(
        "/app/seat/" + (action === "SELECT" ? "select" : "release"),
        {},
        JSON.stringify(message)
      );
      console.log("📤 Gửi dữ liệu:", message);
    } else {
      console.warn("⚠️ WebSocket chưa sẵn sàng.");
    }
  };

  return {
    sendSeatAction,
  };
}
