import { io, Socket } from 'socket.io-client';

// ==========================================
// CONFIGURACIÓN DE SOCKET.IO
// ==========================================

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL;

let socket: Socket | null = null;

/**
 * Obtiene o crea una instancia del socket
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Logs de conexión
    socket.on('connect', () => {
      console.log('✅ [Socket] Conectado al servidor:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ [Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [Socket] Error de conexión:', error);
    });
  }

  return socket;
};

/**
 * Desconecta el socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('🔌 [Socket] Desconectando...');
    socket.disconnect();
    socket = null;
  }
};

/**
 * Suscribe al socket a una transacción específica
 */
export const suscribirseATransaccion = (transaccionId: string): void => {
  const socketInstance = getSocket();
  console.log('🔔 [Socket] Suscribiéndose a transacción:', transaccionId);
  socketInstance.emit('suscribirse-a-transaccion', { transaccionId });
};

/**
 * Hook para escuchar cuando un pago se completa
 */
export const onPagoCompletado = (
  callback: (data: { reservaId: number; mensaje: string }) => void
): (() => void) => {
  const socketInstance = getSocket();

  console.log('👂 [Socket] Escuchando evento "pago-completado"');
  socketInstance.on('pago-completado', callback);

  // Retorna función para limpiar el listener
  return () => {
    console.log('🧹 [Socket] Removiendo listener "pago-completado"');
    socketInstance.off('pago-completado', callback);
  };
};
