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

app.get("/", (req, res) => {
  res.render("index.html");
});

var rooms = { socket_id: [], room_num: [] },
  room_num = 0;
io.on("connection", (socket) => {
  console.log("New user detected");

  socket.on("join-room", (id) => {
    console.log(`\n\nWelcome: ${id}\n`);

    rooms.socket_id.push(id);
    rooms.room_num.push(room_num.toString());

    socket.join(room_num.toString()); // join the room

    if (rooms.socket_id.length % 2 == 0) {
      room_num++;
    }

    for (var i = 0; i < rooms.socket_id.length; i++) {
      console.log(rooms.socket_id[i], rooms.room_num[i]);
    }
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    let room_index = rooms.socket_id.indexOf(data.id);
    let room_name = rooms.room_num[room_index];
    io.to(room_name).emit("message-sent", {
      message: data.message,
      sender: data.id,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
    let index = rooms.socket_id.indexOf(socket.id);
    rooms.socket_id.splice(index, 1);
    rooms.room_num.splice(index, 1);

    if (rooms.socket_id.length % 2 == 1) {
      room_num--;
    }
  });
});
