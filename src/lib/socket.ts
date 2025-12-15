import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (storeId: string, token: string): Socket => {
  // ✅ CHỈ CHECK socket tồn tại, KHÔNG check connected
  if (socket) {
    return socket;
  }

  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: { token },
    query: { storeId },
    transports: ['websocket'], // ✅ websocket only
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket!.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket error:', err.message);
  });

  return socket;
};

export const initAdminSocket = (token: string): Socket => {
  if (socket) return socket;

  socket = io(
    process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
    {
      auth: { token },
      transports: ['websocket'],
    }
  );

  return socket;
};

// ❗️CHỈ GỌI KHI LOGOUT
export const disconnectSocket = () => {
  if (!socket) return;

  socket.removeAllListeners(); // ✅ cleanup đúng
  socket.disconnect();
  socket = null;
};

export const getSocket = (): Socket | null => socket;
