export const socket_events = {
  ping: "",
  connected: "",
  received: "",
  send_to_all: "",
  send_to_all_except_self: "",
  send_to_self: "",
  send_to_one: "",
  send_to_all_in_room: "",
  send_to_one_in_room: "",
  join_room: "",
  leave_room: "",
  create_user: "",
  check_username_availability: "",
  get_user: "",
  get_users: "",
};

for (let key in socket_events) {
  socket_events[key] = key;
}
