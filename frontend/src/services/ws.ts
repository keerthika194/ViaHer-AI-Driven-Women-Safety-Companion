import { useEffect, useRef, useState } from "react";

export function useWebSocket(userId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    const url = `${import.meta.env.VITE_WS_BASE_URL}/ws/${userId}`;
    const ws = new WebSocket(url);
    ws.onmessage = (event) => setLastMessage(JSON.parse(event.data));
    wsRef.current = ws;
    return () => ws.close();
  }, [userId]);

  const send = (data: object) => {
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.send(JSON.stringify(data));
  };

  return { lastMessage, send };
}
