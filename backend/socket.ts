import { Socket } from "socket.io";
import { socket_events } from "../global/constants/socket_events";
import { message } from "../types/chat";

let userinfo = {
  name2id: {},
  id2name: {},
  id: [],
};

export const socketlogic = (socket: Socket | any, io: Socket) => {
  console.log("server was connected to client", socket.id);
  userinfo.id.push(socket.id);
  console.log("0-------------------------------------", socket.id, userinfo);
  store_user(socket.id, socket.id);
  console.log("x");

  io.emit(socket_events.new_user_joined, userinfo, socket.id);

  socket.emit(socket_events.connected, socket.id);

  socket.on(socket_events.get_user, (last_id, callback) => {
    console.log("getusers");
    const username = userinfo.id2name[last_id];
    if (!username) {
      userinfo.name2id[username] = socket.id;
      return;
    }
    if (username.length == 20) {
      delete userinfo.name2id[username];
      delete userinfo.id2name[username];
      store_user(socket.id, socket.id);
      callback(socket.id);
      return;
    }

    delete userinfo.id2name[last_id];
    store_user(socket.id, username || socket.id);
    callback(username);
  });

  socket.on(socket_events.ping, (arg) => {
    console.log(socket_events.ping, arg);
  });

  socket.on(socket_events.send_to_all, (message: string) => {
    console.log(socket_events.received);
    const data: message = {
      user: socket.id,
      username: userinfo.id2name[socket.id],
      text: message,
    };
    io.emit(socket_events.received, data);
  });

  socket.on(socket_events.get_users, (callback) => {
    console.log(userinfo);
    callback(userinfo);
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
    return callback(!userinfo.name2id[username]);
  });

  socket.on(socket_events.create_user, (username, callback) => {
    if (userinfo.name2id[username]) return callback(false);
    // delete old username that is already assigned to this socket id
    delete userinfo.name2id[userinfo.id2name[socket.id]];

    store_user(socket.id, username);
    io.emit(socket_events.new_user_renamed, userinfo);
    callback(true);
  });
};

function store_user(id, username) {
  console.log("storing--" + username);
  userinfo.name2id[username] = id;
  userinfo.id2name[id] = username;
}
