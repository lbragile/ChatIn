const express = require("express");
const socket = require("socket.io");
const path = require("path");

const app = express();
app.use(express.json({ limit: "1mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static(path.join(__dirname, "public"))); // use all files defined in public folder
app.set("view engine", "ejs"); // set the engine

// not using database since this project is simply for the chat system
var users = ["admin"];

app.get("/", (req, res) => {
  res.render("login", { message: "" });
});

app.post("/", (req, res) => {
  if (req.body.username.indexOf(" ") >= 0) {
    res.render("login", { message: "Remove space" });
  } else if (users.includes(req.body.username.toLowerCase())) {
    res.render("login", { message: "Username exists" });
  } else {
    users.push(req.body.username);
    res.status(302).redirect("/chat");
  }
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

var rooms = { socket_id: [], room_num: [] },
  room_num = 0;
io.on("connection", (socket) => {
  console.log("New user detected");
  socket.username = users[users.length - 1];
  socket.on("join-room", (id) => {
    console.log(`\n\nWelcome: ${id}\n`);

    rooms.socket_id.push(id);
    rooms.room_num.push(room_num.toString());

    socket.join(room_num.toString()); // join the room

    if (rooms.socket_id.length % 2 == 0) {
      room_num++;
      var clients = Object.keys(
        io.sockets.adapter.rooms[`${room_num - 1}`].sockets
      );

      var sent_data = {
        first: clients[0],
        second: clients[1],
      };
      socket.to(`${room_num - 1}`).emit("users-joined", sent_data); // to first user
      socket.emit("users-joined", sent_data); // to second user
    }

    for (var i = 0; i < rooms.socket_id.length; i++) {
      console.log(rooms.socket_id[i], rooms.room_num[i]);
    }
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    let room_index = rooms.socket_id.indexOf(data.id);
    let room_name = rooms.room_num[room_index];
    let socket_list = io.sockets.adapter.rooms[room_name].sockets;

    // only send a message when there are 2 clients in the specific chat room
    if (Object.keys(socket_list).length == 2) {
      io.to(room_name).emit("message-sent", {
        message: data.message,
        sender: data.id,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    let user_index = users.indexOf(socket.username);
    users.splice(user_index, 1);

    let index = rooms.socket_id.indexOf(socket.id);
    rooms.socket_id.splice(index, 1);
    rooms.room_num.splice(index, 1);

    socket.leave(room_num.toString());
    if (rooms.socket_id.length % 2 == 1) {
      room_num--;
    }
  });
});
