import { Socket } from "socket.io";
import { socket_events } from "../global/constants/socket_events";

export const socketlogic = (socket: Socket, io: Socket) => {
  console.log("server was connected to client", socket.id);

  socket.emit(socket_events.connected, socket.id);
  socket.broadcast.emit("connectx", "another client joined the server");

  socket.on(socket_events.ping, (arg) => {
    console.log("ping", arg);
  });

  socket.on(socket_events.send_to_all, (message: string) => {
    console.log("received");
    const data = { user: socket.id, text: message };
    io.emit(socket_events.received, data);
  });

  socket.on(socket_events.send_to_all_except_self, (message: string) => {
    console.log(socket_events.send_to_all_except_self);
    const data = { user: socket.id, text: message };
    socket.broadcast.emit(socket_events.received, data);
    // socket.emit(socket_events.received, data);
  });

  socket.on(socket_events.send_to_self, (message: string) => {
    console.log(socket_events.send_to_self);
    const data = { user: socket.id, text: message };
    io.emit(socket_events.received, data);
  });

  socket.on(
    socket_events.send_to_one,
    (message: string, room: string | string[]) => {
      console.log(socket_events.send_to_one);
      const data = { user: socket.id, text: message };
      socket.to(room).emit(socket_events.received, data);
    }
  );
};
