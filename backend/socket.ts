import { Socket } from "socket.io";
import { socket_events } from "../global/constants/socket_events";

let userinfo = {
  name2id: {},
  id2name: {},
};

export const socketlogic = (socket: Socket | any, io: Socket) => {
  console.log("server was connected to client", socket.id);

  socket.emit(socket_events.connected, socket.id);
  socket.broadcast.emit("connectx", "another client joined the server");

  socket.on(socket_events.get_user, (last_id, callback) => {
    const username = userinfo.id2name[last_id];
    delete userinfo.id2name[last_id];
    userinfo.id2name[socket.id] = username;
    userinfo.name2id[username] = socket.id;
    console.log(socket.id, last_id, username);
    callback(username);
  });

  socket.on(socket_events.ping, (arg) => {
    console.log(socket_events.ping, arg);
  });

  socket.on(socket_events.send_to_all, (message: string) => {
    console.log(socket_events.received);
    const data = {
      user: socket.id,
      username: userinfo.id2name[socket.id],
      text: message,
    };
    io.emit(socket_events.received, data);
  });

  socket.on(socket_events.send_to_all_except_self, (message: string) => {
    console.log(socket_events.send_to_all_except_self);
    const data = { user: socket.id, text: message };
    socket.broadcast.emit(socket_events.received, data);
  });

  socket.on(socket_events.send_to_self, (message: string) => {
    console.log(socket_events.send_to_self);
    const data = { user: socket.id, text: message };
    socket.emit(socket_events.received, data);
  });

  socket.on(
    socket_events.send_to_one,
    (message: string, room: string | string[]) => {
      console.log(socket_events.send_to_one);
      const data = { user: socket.id, text: message };
      socket.to(room).emit(socket_events.received, data);
    }
  );

  socket.on(
    socket_events.send_to_all_in_room,
    (message: string, room: string | string[]) => {
      console.log(socket_events.send_to_all_in_room);
      const data = { user: socket.id, text: message };
      socket.to(room).emit(socket_events.received, data);
    }
  );

  socket.on(socket_events.join_room, (user, room, callback) => {
    console.log(socket_events.join_room, user, room);
    socket.join(room);
    callback && callback("joined room " + room);
  });

  socket.on(socket_events.leave_room, (user, room, callback) => {
    console.log(socket_events.leave_room, user, room);
    socket.leave(room);
    callback && callback("left room " + room);
  });

  socket.on(socket_events.check_username_availability, (username, callback) => {
    if (userinfo.name2id[username]) return callback(false);
    // users.name2id[username] = socket.id;
    callback(true);
  });

  socket.on(socket_events.create_user, (username, callback) => {
    if (userinfo.name2id[username]) return callback(false);
    // delete old username that is already assigned to this socket id
    delete userinfo.name2id[userinfo.id2name[socket.id]];

    userinfo.name2id[username] = socket.id;
    userinfo.id2name[socket.id] = username;
    console.log(userinfo, username);
    callback(true);
  });

  socket.on(socket_events.get_user, (id, callback) => {
    const username = userinfo.id2name[id];
    if (!username) return;
    delete userinfo.id2name[id];
    userinfo.name2id[username] = socket.id;
    userinfo.id2name[socket.id] = username;
    console.log(userinfo, id);
    callback(username);
  });
};
