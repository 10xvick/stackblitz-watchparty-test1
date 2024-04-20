import { Socket } from "socket.io";
import { socket_events } from "../global/constants/socket_events";
import { message } from "../types/chat";

let userinfo = {
  name2id: {},
  id2name: {},
  id: [],
  info: {},
};

export const socketlogic = (socket: Socket | any, io: Socket) => {
  console.log("server was connected to client", socket.id);
  userinfo.id.push(socket.id);
  io.emit(socket_events.new_user_joined);

  socket.on(socket_events.update_user_info, ({ peer }) => {
    userinfo.info[socket.id] ||= {};
    userinfo.info[socket.id].peer = peer;
    console.log("info", userinfo.info);
  });

  socket.on(socket_events.disconnect, () => {
    userinfo.id = userinfo.id.filter((id) => id != socket.id);
    delete userinfo.info[socket.id];
    io.emit(socket_events.new_user_disconnected);
  });

  socket.on(socket_events.get_users, (callback) => {
    console.log(socket_events.get_users, userinfo.id);
    callback(userinfo);
  });

  socket.on(socket_events.ping, (arg) => {
    console.log(socket_events.ping, arg + " from " + socket.id);
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

  // socket.on(socket_events.check_username_availability, (username, callback) => {
  //   return callback(!userinfo.name2id[username]);
  // });

  // socket.on(socket_events.create_user, (username, callback) => {
  //   if (userinfo.name2id[username]) return callback(false);
  //   // delete old username that is already assigned to this socket id
  //   delete userinfo.name2id[userinfo.id2name[socket.id]];

  //   store_user(socket.id, username);
  //   io.emit(socket_events.new_user_renamed, userinfo);
  //   callback(true);
  // });
};

function store_user(id, username) {
  console.log("storing--" + username);
  userinfo.name2id[username] = id;
  userinfo.id2name[id] = username;
}
