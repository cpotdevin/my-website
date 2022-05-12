import type DrawLineMessage from '$lib/interfaces/drawLineMessage';

let socket: undefined | WebSocket;

const connectToSketchPadWebSocket = (callback: (message: MessageEvent) => void) => {
  socket = new WebSocket('ws://my-backend.ptd.vin/sketch-pad');

  socket.onmessage = (message: MessageEvent) => {
    callback(message);
  };
};

const sendDrawMessage = (drawLineMessage: DrawLineMessage) => {
  if (socket) {
    socket.send(JSON.stringify(drawLineMessage));
  }
};

export { connectToSketchPadWebSocket, sendDrawMessage };
