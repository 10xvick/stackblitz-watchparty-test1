import { createRef, useEffect, useState } from "react";
import { endpoints } from "../../global/constants/endpoints";
import { message } from "../../types/chat";

import "./index.css";
import { io } from "socket.io-client";
const api = endpoints.server;
const socket = io(endpoints.server.url);
socket.connect();

socket.on("connectx", (data) => {
  console.log(data);
});

const initalmessages: message[] = [];

function App() {
  const data = fetchData(api.url);
  const messageinputref = createRef<HTMLInputElement>();
  const [messages, setmessages] = useState(initalmessages);
  const [id, setid] = useState("");

  useEffect(() => {
    socket.on("connected", (id) => {
      setid(id);
    });
    socket.on("new-message-received", (message: message) => {
      messages.push(message);
      setmessages([...messages]);
    });
  }, []);

  if (!id) return <>connecting...</>;
  return (
    <>
      data:{data}
      <button
        onClick={(e) => {
          console.log(e.target);
          socket.emit("hello", { message: "world" });
        }}
      >
        test
      </button>
      <hr />
      user:{id} <br />
      <input ref={messageinputref} />
      <button
        onClick={() => {
          socket.emit("new-message", messageinputref.current?.value);
        }}
      >
        send
      </button>
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
      {messages.map((e: message) => (
        <div style={{ color: id == e.user ? "blue" : "black" }}>
          {e.text}
          ------<small>{e.user}</small>
        </div>
      ))}
    </div>
  );
}
