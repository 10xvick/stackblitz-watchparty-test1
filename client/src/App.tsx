import { createRef, useEffect, useState } from "react";
import { endpoints } from "../../global/constants/endpoints";
import { message } from "../../types/chat";
import { socket_events } from "../../global/constants/socket_events";

import "./index.css";

import { io } from "socket.io-client";
const socket = io(endpoints.server.url);
socket.connect();

socket.on("connectx", (data) => {
  console.log(data);
});

const initalmessages: message[] = [];

const api = endpoints.server;
function App() {
  const data = fetchData(api.url);
  const messageinputref = createRef<HTMLInputElement>();
  const roominputref = createRef<HTMLInputElement>();
  const [messages, setmessages] = useState(initalmessages);
  const [room, setroom] = useState("");
  const [id, setid] = useState("");

  useEffect(() => {
    socket.on("connected", (id) => {
      setid(id);
    });
    socket.on("received", (message: message) => {
      setmessages((messages) => [...messages, message]);
    });
  }, []);

  if (!id) return <>connecting...</>;
  return (
    <>
      data:{data}
      <button
        onClick={(e) => {
          socket.emit("hello", { message: "world" });
        }}
      >
        say hello to socket server
      </button>
      <hr />
      user:{id} <br />
      <input ref={messageinputref} />
      <button
        onClick={() => {
          socket.emit(socket_events.ping, messageinputref.current?.value);
        }}
      >
        ping
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
            socket_events.send_to_all_except_self,
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
      <input ref={roominputref} />
      <Chat messages={messages} id={id} />
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
          {e.text}
          ------<small>{e.user}</small>
        </div>
      ))}
    </div>
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
    console.log("error-----------------------------", e);
  });
