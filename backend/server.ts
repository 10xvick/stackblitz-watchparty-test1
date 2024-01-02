import { Socket } from "socket.io";
import { endpoints } from "../global/constants/endpoints";
import { products } from "./products";
import { generate } from "./utility";
import { socketlogic } from "./socket";

const express = require("express");
const { createServer } = require("node:http");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(bodyParser.json());
const server = createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Replace with the origin of your React app
    methods: ["GET", "POST"],
  },
});
const port = endpoints.server.port;

io.on("connection", (socket) => socketlogic(socket));

// generate(app, products);

app.get("/test", function (req, res) {
  setTimeout(function () {
    res.json({
      data: "server is running and accepting requests from client",
    });
  }, 2000);
});

server.listen(port, function () {
  return console.log("app is running on http://localhost:".concat(`${port}`));
});
