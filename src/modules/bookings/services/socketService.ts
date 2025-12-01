import { io, Socket } from 'socket.io-client';

// ==========================================
// CONFIGURACION DE SOCKET.IO
// ==========================================

// Resolucion de URL para socket:
// 1) VITE_SOCKET_URL (preferido)
// 2) VITE_SERVER_URL (backend base)
// 3) VITE_API_BASE_URL sin el sufijo /api
// 4) window.location.origin como ultimo recurso (dev server)
const apiBase = import.meta.env.VITE_API_BASE_URL;
const derivedSocketUrl = apiBase ? apiBase.replace(/\/api\/?$/, '') : '';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_SERVER_URL ||
  derivedSocketUrl ||
  window.location.origin;

let socket: Socket | null = null;

/**
 * Obtiene o crea una instancia del socket
 */
export const getSocket = (): Socket => {
  if (!SOCKET_URL) {
    throw new Error('[Socket] No se configuro la URL del socket (VITE_SOCKET_URL/VITE_SERVER_URL/VITE_API_BASE_URL)');
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Logs de conexion
    socket.on('connect', () => {
      console.log('[Socket] Conectado al servidor:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Error de conexion:', error);
    });
  }

  return socket;
};

/**
 * Desconecta el socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('[Socket] Desconectando...');
    if (socket.connected) {
      socket.disconnect();
    } else {
      socket.removeAllListeners();
    }
    socket = null;
  }
};

/**
 * Suscribe al socket a una transaccion especifica
 */
export const suscribirseATransaccion = (transaccionId: string): void => {
  const socketInstance = getSocket();
  const subscribe = () => {
    console.log('[Socket] Suscribiendose a transaccion:', transaccionId);
    socketInstance.emit('suscribirse-a-transaccion', { transaccionId });
  };

  if (socketInstance.connected) {
    subscribe();
  } else {
    socketInstance.once('connect', subscribe);
  }
};

/**
 * Hook para escuchar cuando un pago se completa
 */
export const onPagoCompletado = (
  callback: (data: { reservaId: number; mensaje: string }) => void
): (() => void) => {
  const socketInstance = getSocket();

  const eventos = [
    'pago-completado',
    'pago-actualizado',
    'pago-confirmado',
    'transaccion-completada',
    'transaccion-actualizada',
    'transaccion-pagada',
  ];

  console.log('[Socket] Escuchando eventos de pago:', eventos.join(', '));
  eventos.forEach((evento) => socketInstance.on(evento, callback));

  // Loggear cualquier evento recibido para depurar
  const logAny = (event: string, ...args: unknown[]) => {
    if (event.startsWith('pago') || event.startsWith('transaccion')) {
      console.log('[Socket] Evento recibido:', event, args[0]);
    }
  };
  socketInstance.onAny(logAny);

  // Retorna funcion para limpiar el listener
  return () => {
    console.log('[Socket] Removiendo listener de eventos de pago');
    eventos.forEach((evento) => socketInstance.off(evento, callback));
    socketInstance.offAny(logAny);
  };
};
