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
    if (req.body.username.toLowerCase() != "admin") {
      users.push(req.body.username);
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

// ADMIN
admin.on("connection", (socket) => {
  socket.username = "admin";

  socket.on("chat", (username) => {
    console.log(`\n\n ${username} - Wants to chat\n`);
  });

  socket.on("message-sent", (data) => {
    client.emit("message-received", data);
    socket.emit("message-received", data);
  });

  socket.on("typing", (username) => {
    client.emit("admin-typing", username);
  });

  socket.on("stop-typing", () => {
    client.emit("admin-stop-typing");
  });
});

// CLIENT
client.on("connect", (socket) => {
  socket.username = users[users.length - 1];

  socket.on("chat", () => {
    console.log(`\n\nWelcome user - ${socket.username}\n`);
    admin.emit("join-request", socket.username);
    client.emit("chat-entered", socket.username);
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    admin.emit("message-received", data);
    socket.emit("message-received", data);
  });

  socket.on("typing", (username) => {
    admin.emit("client-typing", username);
  });

  socket.on("stop-typing", () => {
    admin.emit("client-stop-typing");
  });

  socket.on("disconnect", () => {
    console.log(`${socket.username} disconnected`);

    let index = users.indexOf(socket.username);
    users.splice(index, 1);
  });
});
