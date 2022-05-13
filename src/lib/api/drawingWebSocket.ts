import { dev } from '$app/env';
import type DrawLineMessage from '$lib/interfaces/DrawLineMessage';

let socket: undefined | WebSocket;

const connectToSketchPadWebSocket = (
  onOpen: () => void,
  onClose: () => void,
  onMessage: (message: MessageEvent) => void,
) => {
  socket = new WebSocket(
    dev ? 'ws://localhost:8080/sketch-pad' : 'wss://my-backend.ptd.vin/sketch-pad',
  );

  socket.onmessage = (message: MessageEvent) => {
    onMessage(message);
  };

  socket.onclose = () => {
    onClose();
  };

  socket.onopen = () => {
    onOpen();
  };
};

const sendDrawMessage = (drawLineMessage: DrawLineMessage) => {
  if (socket) {
    socket.send(JSON.stringify(drawLineMessage));
  }
};

export { connectToSketchPadWebSocket, sendDrawMessage };
