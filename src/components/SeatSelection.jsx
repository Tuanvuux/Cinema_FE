import React, { useEffect, useState } from "react";
import Stomp from "stompjs";
import SockJS from "sockjs-client";

const SeatSelection = ({ showtimeId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const sock = new SockJS("/ws");
    const stompClient = Stomp.over(sock);
    stompClient.connect({}, () => {
      stompClient.subscribe(`/topic/seats/${showtimeId}`, (message) => {
        setMessages((prevMessages) => [...prevMessages, message.body]);
      });
    });
    setSocket(stompClient);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [showtimeId]);

  const handleSelectSeat = (seatId) => {
    fetch("/seats/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showtimeId, seatId }),
    });
  };

  const handleReleaseSeat = (seatId) => {
    fetch("/seats/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showtimeId, seatId }),
    });
  };

  return (
    <div>
      <h3>Select or Release Seats for Showtime {showtimeId}</h3>
      <div>
        <button onClick={() => handleSelectSeat("A1")}>Select Seat A1</button>
        <button onClick={() => handleReleaseSeat("A1")}>Release Seat A1</button>
      </div>
      <div>
        <h4>Messages</h4>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default SeatSelection;
