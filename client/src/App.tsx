import { createRef, useEffect, useState } from "react";
import { endpoints } from "../../global/constants/endpoints";
import { message } from "../../types/chat";
import { socket_events } from "../../global/constants/socket_events";

import "./index.css";

import { Socket, io } from "socket.io-client";

const socket: Socket = io(endpoints.server.url);
const last_id = localStorage.getItem("last_id");
socket.connect();

const initalmessages: message[] = [];

const api = endpoints.server;

function App() {
  const data = fetchData(api.url);
  const [username, setusername] = useState("");
  const messageinputref = createRef<HTMLInputElement>();
  const roominputref = createRef<HTMLInputElement>();
  const [messages, setmessages] = useState(initalmessages);
  const [id, setid] = useState("");

  useEffect(() => {
    socket.on("connected", (id: string) => {
      setid(id);
      socket.emit(socket_events.get_user, last_id, (username: string) => {
        setusername(username);
        localStorage.setItem("last_id", socket.id);
      });
    });
    socket.on("received", (message: message) => {
      setmessages((messages) => [...messages, message]);
    });
  }, []);

  if (!id) return <>connecting...</>;
  return (
    <>
      data:{data}
      <br />
      user:{id} | {username}
      <br />
      <input ref={messageinputref} placeholder="message" />
      <button
        onClick={() => {
          socket.emit(socket_events.ping, messageinputref.current?.value);
        }}
      >
        ping
      </button>
      <button
        onClick={() => {
          socket.emit(socket_events.get_users, console.log);
        }}
      >
        get users
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.send_to_all,
            messageinputref.current?.value
          );
        }}
      >
        send to all
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.send_to_all_except_self,
            messageinputref.current?.value
          );
        }}
      >
        send to all except self
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.send_to_self,
            messageinputref.current?.value
          );
        }}
      >
        send to self
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.send_to_one,
            messageinputref.current?.value,
            roominputref.current?.value
          );
        }}
      >
        send to one
      </button>
      <input ref={roominputref} placeholder="room" />
      <button
        onClick={() => {
          socket.emit(
            socket_events.join_room,
            messageinputref.current?.value,
            roominputref.current?.value,
            (info: string) => {
              alert(info);
            }
          );
        }}
      >
        join room
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.join_room,
            messageinputref.current?.value,
            roominputref.current?.value,
            (info: string) => {
              alert(info);
            }
          );
        }}
      >
        leave room
      </button>
      <button
        onClick={() => {
          socket.emit(
            socket_events.send_to_all_in_room,
            messageinputref.current?.value,
            roominputref.current?.value,
            (info: string) => {
              alert(info);
            }
          );
        }}
      >
        send to room
      </button>
      <CreateUser value={[username, setusername, socket]} />
      <hr />
      <Chat messages={messages} id={id} />
      <hr />
    </>
  );
}

export default App;

function fetchData(url: string) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url + "/test")
      .then((e) => e.text())
      .then((e: any) => {
        setData(e);
      })
      .catch((e) => console.error(e));
  }, []);

  return data;
}

function Chat({ messages, id }: { messages: message[]; id: String }) {
  return (
    <div>
      {messages.map((e: message, i) => (
        <div key={i} style={{ color: id == e.user ? "blue" : "black" }}>
          {e.text}------------<small>{e.username || e.user}</small>
        </div>
      ))}
    </div>
  );
}

function CreateUser({ value: [username, setusername, socket] }: any) {
  const [username_available, setusername_available] = useState("");
  const username_ref = createRef<HTMLInputElement>();

  function check_user_availability() {
    socket.emit(
      socket_events.check_username_availability,
      username_ref.current?.value,
      (available: string) => {
        setusername_available(available);
        console.log(available);
      }
    );
  }

  function create_user() {
    const username = username_ref.current?.value;
    socket.emit(socket_events.create_user, username, (e: boolean) => {
      if (e) {
        localStorage.setItem("last_id", socket.id);
      }
      alert(
        e ? "created successfully" : "duplicate user, try different username"
      );
    });
    setusername(username_ref.current?.value);
    check_user_availability();
  }

  return (
    <>
      <hr />
      <div>
        username:
        <input
          ref={username_ref}
          style={{ background: username_available ? "" : "#ffaaaa" }}
          placeholder={username || "username"}
          onChange={check_user_availability}
        />
        <button disabled={!Boolean(username_available)} onClick={create_user}>
          {username ? "rename" : "create"}
        </button>
      </div>
    </>
  );
}

fetch(
  "https://stackblitzwatchpartytest1-uygi--5174--f7aa08df.local-credentialless.webcontainer.io"
)
  .then((e) => e.json())
  .then((e) => {
    console.log("-----------------------------------------------", e);
  })
  .catch((e) => {
    console.log("error------------------------------------------", e);
  });
