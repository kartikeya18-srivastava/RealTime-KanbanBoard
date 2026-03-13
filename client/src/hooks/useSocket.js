import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const useSocket = (boardId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !boardId) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('board:join', { token, boardId });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    socketRef.current.on('presence:update', (data) => {
      setPresence(data.presence || []);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [boardId]);

  const emitEvent = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const onEvent = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const offEvent = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return { socket: socketRef.current, isConnected, presence, emitEvent, onEvent, offEvent };
};

export default useSocket;
