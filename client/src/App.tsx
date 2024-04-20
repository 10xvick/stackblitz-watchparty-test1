import { createRef, useEffect, useState } from "react";
import { endpoints } from "../../global/constants/endpoints";
import { message } from "../../types/chat";
import { socket_events } from "../../global/constants/socket_events";
import { PeerApp } from "./webrtc/peer";
import "./index.css";
import { Socket, io } from "socket.io-client";
import Peer, { DataConnection } from "peerjs";

const socket: Socket = io(endpoints.server.url);
socket.connect();
const peer = new Peer();

const initalmessages: message[] = [];

const api = endpoints.server;

function App() {
  const data = fetchData(api.url);
  const [username, setusername] = useState("");
  const messageinputref = createRef<HTMLInputElement>();
  const roominputref = createRef<HTMLInputElement>();
  const [messages, setmessages] = useState(initalmessages);
  const [socketid, setsocketid] = useState("");
  const [users, setusers] = useState<Array<string>>([]);
  const [videos, setvideos] = useState<any>([]);

  function updateusers() {
    socket.emit(socket_events.get_users, (userinfo: any) => {
      const users = userinfo.id;
      setusers(users.filter((id: string) => id != socket.id));
      setsocketid(socket.id);
    });
  }

  useEffect(() => {
    peer.on("open", (id: string) => {
      console.log("my peer id is " + id);
      socket.emit(socket_events.update_user_info, { peer: id });
    });
    peer.on("connection", (conn: DataConnection) => {
      conn.on("data", (data) => {
        // Will print 'hi!'
        console.log(data);
      });
    });
    peer.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          console.log(stream);
          call.answer(stream);
        })
        .catch((error) => {
          console.warn("stream error", error);
          call.answer();
        });
    });
  }, [peer]);

  useEffect(() => {
    socket.on(socket_events.connect, () => {
      //get existing users
      updateusers();
    });

    socket.on(socket_events.new_user_joined, () => {
      console.log("new user joined");
      //update users
      updateusers();
    });

    socket.on(socket_events.new_user_disconnected, () => {
      //update users
      updateusers();
    });

    socket.on("received", (message: message) => {
      setmessages((messages) => [...messages, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!socketid) return <>connecting...</>;
  return (
    <>
      data:{data}
      <br />
      user:{socketid} | {username}
      <br />
      <hr />
      {users.map((e: string) => (
        <button
          onClick={() => {
            const video = (
              <video
                key={Math.random()}
                autoPlay
                src="https://videos.pexels.com/video-files/852421/852421-sd_640_360_30fps.mp4"
              />
            );
            setvideos((videos: any) => [...videos, video]);
            console.log(video);

            socket.emit(socket_events.get_users, (userinfo: any) => {
              const peerid = userinfo.info[e]?.peer;
              console.log(peerid);
              const conn = peer.connect(peerid);
              conn.on("open", () => {
                conn.send("peer says hi!");
                console.log("connection stablished", peerid);

                navigator.mediaDevices
                  .getUserMedia({ video: true, audio: true })
                  .then((stream) => {
                    const call = peer.call(peerid, stream);
                    call.on("stream", (remoteStream) => {
                      console.log("streaming", remoteStream);
                    });
                  })
                  .catch((error) => {
                    console.warn("stream error c : ", error);
                  });
              });
            });
          }}
        >
          {e}
        </button>
      ))}
      <hr />
      videos: {...videos}
      <hr />
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
            socket_events.leave_room,
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
      <Chat messages={messages} id={socketid} />
      <hr />
      <PeerApp id={socketid} users={users} />
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
