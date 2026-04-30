import { io } from "socket.io-client";

let socketInstance = null;
let boundErrorLogger = false;

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const getSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      withCredentials: true,
    });
  }

  if (token) {
    socketInstance.auth = { token };
  }

  if (!boundErrorLogger) {
    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    boundErrorLogger = true;
  }

  if (!socketInstance.connected && !socketInstance.active) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
    boundErrorLogger = false;
  }
};

export default getSocket;
