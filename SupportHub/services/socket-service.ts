import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

let socket: Socket | null = null;

const SOCKET_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://127.0.0.1:5001';

export const connectSocket = async () => {
  const token = await SecureStore.getItemAsync('token');
  
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Connected to socket.io server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket.io server');
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinTicket = (ticketId: string) => {
  if (socket) {
    socket.emit('agent:join_ticket', { ticketId });
  }
};

export const leaveTicket = (ticketId: string) => {
  if (socket) {
    socket.emit('agent:leave_ticket', { ticketId });
  }
};

export const sendSocketMessage = (ticketId: string, text: string) => {
  if (socket) {
    socket.emit('agent:send_message', { ticketId, text });
  }
};

export const getSocket = () => socket;
