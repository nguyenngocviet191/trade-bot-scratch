import { useEffect, useRef, useState } from "react";

export function useWebSocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      setMessage(event.data);
    };

    socket.onerror = (err) => console.error("WebSocket error", err);
    socket.onclose = (event) => {
      console.log('Close code:', event.code);
      console.log('Close reason:', event.reason);
    } 

    return () => socket.close();
  }, [url]);

  const sendMessage = (msg: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(msg);
    } else {
      console.warn("WebSocket not open yet.");
    }
  };

  return { message, sendMessage };
}