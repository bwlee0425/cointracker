// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

interface Options {
  token?: string;
  subscribeTopics?: string[];
  reconnectInterval?: number; // ms
  pingInterval?: number; // ms
}

export const useWebSocket = (baseUrl: string, options?: Options) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const pingTimer = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false); // StrictMode에서 중복 연결 방지

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]); // WebSocket 메시지 저장
  const [error, setError] = useState<string | null>(null);

  const reconnectInterval = options?.reconnectInterval ?? 3000;
  const pingInterval = options?.pingInterval ?? 10000;

  const buildUrl = () => {
    const url = new URL(baseUrl);
    if (options?.token) {
      url.searchParams.set('token', options.token);
    }
    return url.toString();
  };

  const connect = () => {
    if (isMounted.current) return; // 이미 연결 시도 중이면 중복 방지
    isMounted.current = true;

    const url = buildUrl();
    console.log('📡 Connecting to:', url);

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      setError(null); // 연결 성공 시 이전 에러 초기화

      // Subscribe to topics
      if (options?.subscribeTopics?.length) {
        options.subscribeTopics.forEach((topic) => {
          const subMsg = JSON.stringify({ action: 'subscribe', topic });
          socket.send(subMsg);
          console.log('📨 Sent subscribe:', subMsg);
        });
      }

      // Start pinging
      pingTimer.current = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'ping' }));
          console.log('📤 Sent ping');
        }
      }, pingInterval);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
      console.log('📥 WebSocket message:', data);
    };

    socket.onerror = (errorEvent) => {
      const errorMsg = `❌ WebSocket error: ${JSON.stringify(errorEvent)}`;
      console.error(errorMsg);
      setError(errorMsg);
    };

    socket.onclose = (event) => {
      console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
      setIsConnected(false);
      setError(`Connection closed with code ${event.code}: ${event.reason}`);
      clearInterval(pingTimer.current!);
      socketRef.current = null;
      isMounted.current = false;

      // Try to reconnect
      if (event.code !== 1000) { // 정상 종료(1000) 외에 재연결 시도
        reconnectTimer.current = setTimeout(() => {
          console.log('🔁 Reconnecting WebSocket...');
          connect();
        }, reconnectInterval);
      }
    };
  };

  useEffect(() => {
    connect();

    return () => {
      console.log('🧹 Cleaning up WebSocket');
      isMounted.current = false;
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      clearInterval(pingTimer.current!);
      clearTimeout(reconnectTimer.current!);
    };
  }, [baseUrl, options?.token]);

  const sendMessage = (msg: string | object) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = typeof msg === 'string' ? msg : JSON.stringify(msg);
      socketRef.current.send(message);
      console.log('📤 Sent message:', message);
    } else {
      console.warn('Cannot send message: WebSocket is not open');
    }
  };

  return { isConnected, messages, sendMessage, error }; // error 추가 반환
};