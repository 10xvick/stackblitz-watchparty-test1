import { endpoints } from "../global/constants/endpoints";
import { products } from "./products";
import { generate } from "./utility";
import { socketlogic } from "./socket";

const app = require("express")();
app.use(require("cors")());
app.use(require("body-parser").json());

const server = require("node:http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*", // client app's origin url
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => socketlogic(socket, io));

// generate(app, products);

app.get("", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/test", function (req, res) {
  setTimeout(function () {
    res.json({
      data: "server is running",
    });
  }, 2000);
});

const port = endpoints.server.port;
server.listen(port, function () {
  return console.log("app is running on " + endpoints.server.url);
});
