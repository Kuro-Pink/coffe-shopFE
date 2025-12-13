import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (storeId: string, token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: {
      token,
    },
    query: {
      storeId,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};

export default socket;