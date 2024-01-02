import { Socket } from "socket.io";
import { message } from "../types/chat";

export const socketlogic = (socket: Socket) => {
  console.log("server was connected to client", socket.id);

  socket.emit("connected", socket.id);
  socket.broadcast.emit("connectx", "another client joined the server");

  socket.on("hello", (arg) => {
    console.log("hello-from-client", arg);
  });

  socket.on("new-message", (message: String) => {
    const data = { user: socket.id, text: message };
    const event = "new-message-received";
    socket.emit(event, data);
    socket.broadcast.emit(event, data);
  });
};
