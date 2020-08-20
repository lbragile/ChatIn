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
var users = [];

app.get("/", (req, res) => {
  res.render("login", { message: "" });
});

app.post("/", (req, res) => {
  if (req.body.username.indexOf(" ") >= 0) {
    res.render("login", { message: "Remove space" });
  } else if (users.includes(req.body.username.toLowerCase())) {
    res.render("login", { message: "Username exists" });
  } else {
    users.push({ name: req.body.username, id: "" });

    if (req.body.username.toLowerCase() != "admin") {
      res.status(302).redirect("/chat");
    } else {
      res.status(302).redirect("/admin");
    }
  }
});

app.get("/chat", (req, res) => {
  res.render("chat");
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

const admin = io.of("/admin"),
  client = io.of("/chat");

function setUsernameAndRoomname(socket) {
  let index = users.length - 1;
  socket.username = users[index].name;
  console.log(socket.username);
  socket.room_name = socket.username + "_admin";
  users[index].id = socket.id;
}

admin.on("connection", (socket) => {
  socket.on("message_admin", (message) => console.log(message));

  setUsernameAndRoomname(socket);

  socket.on("join-room", (data) => {
    socket.join(data.room);
    clientList(data.room, socket.id); // list of users in the room
  });

  socket.on("message-sent", (data) => {
    client.emit("message-received", {
      message: data.message,
      sender: "admin",
    });
    socket.emit("message-received", {
      message: data.message,
      sender: "admin",
    });
  });
});

client.on("connection", (socket) => {
  socket.on("message_client", (message) => console.log(message));

  setUsernameAndRoomname(socket);

  socket.on("join-room", () => {
    socket.join(socket.room_name); // join the room

    console.log(`\n\nWelcome user - ${socket.username}\n`);
    admin.emit("join-request", {
      username: socket.username,
      room: socket.room_name,
    }); // to admin
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    admin.emit("message-received", {
      message: data.message,
      sender: data.username,
    });
    socket.emit("message-received", {
      message: data.message,
      sender: data.username,
    });
  });

  // socket.on("disconnect", () => {
  //   if (socket.username != "admin") {
  //     console.log(`${socket.username} disconnected`);
  //     socket.leave(socket.room_name); // leave the room

  //     let index = users.indexOf(socket.username);
  //     users.splice(index, 1);
  //   }
  // });
});

function clientList(room_name, admin_id) {
  io.of("/chat")
    .in(room_name)
    .clients((error, client) => {
      if (error) throw error;
      client.push(admin_id);
      console.log(client, "in room: " + room_name);
    });
}
