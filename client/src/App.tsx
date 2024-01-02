import { useEffect, useState } from "react";
import { endpoints } from "../../global/constants/endpoints";

import "./index.css";
import { io } from "socket.io-client";
const api = endpoints.server;
const socket = io(endpoints.server.url);
socket.connect();

socket.on("connectx", (data) => {
  console.log(data);
});

function App() {
  const data = fetchData(api.url);

  return (
    <>
      {" "}
      data:{data}
      <button
        onClick={(e) => {
          console.log(e.target);
          socket.emit("hello", { message: "world" });
        }}
      >
        {" "}
        test{" "}
      </button>
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
