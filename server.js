const express = require("express");
const socket = require("socket.io");
const path = require("path");
const { render } = require("ejs");
const { error } = require("console");

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
  var lower_username = req.body.username.toLowerCase();
  if (req.body.username.indexOf(" ") >= 0) {
    res.render("login", { message: "Remove space" });
  } else if (users.includes(lower_username)) {
    res.render("login", { message: "Username exists" });
  } else if (lower_username == "") {
    res.render("login", { message: "Cannot be blank" });
  } else {
    users.push(req.body.username);
    if (lower_username != "admin") {
      res.status(302).redirect("/chat?username=" + req.body.username);
    } else {
      res.status(302).redirect("/admin");
    }
  }
});

app.get("/chat", (req, res) => {
  if (req.query.id != undefined) {
    res.render("admin_chat");
  } else {
    res.render("chat");
  }
});

app.get("/admin", (req, res) => {
  res.render("admin_menu");
});

const chat_nsp = io.of("/chat"),
  admin_nsp = io.of("/admin");

function listClients(room_name) {
  chat_nsp.in(room_name).clients((error, clients) => {
    if (error) throw error;
    console.log(clients);
  });
}

// CLIENT
chat_nsp.on("connect", (socket) => {
  var url = new URL(socket.request.headers.referer);
  socket.username = url.searchParams.get("username");

  var client_id = url.searchParams.get("id");
  if (client_id != undefined) {
    let room = "admin_/chat#" + client_id;
    socket.join(room, listClients(room));
  }

  socket.on("chat", () => {
    console.log(`\n\nWelcome user - ${socket.username}\n`);

    let room = "admin_" + socket.id;
    socket.join(room, listClients(room));

    admin_nsp.emit("join-request", {
      id: socket.id.replace("/chat#", ""),
      username: socket.username,
      users,
    });

    socket.emit("chat-entered");
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    chat_nsp.in(Object.keys(socket.rooms)[1]).emit("message-received", data);
  });

  socket.on("typing", (username) => {
    socket.to(Object.keys(socket.rooms)[1]).emit("typing", username);
  });

  socket.on("stop-typing", () => {
    socket.to(Object.keys(socket.rooms)[1]).emit("stop-typing");
  });

  socket.on("disconnect", () => {
    var url = new URL(socket.request.headers.referer);

    // only client side disconnection must be considered
    if (url.searchParams.get("id") == undefined) {
      console.log(`${socket.username} disconnected`);

      let index = users.indexOf(socket.username);
      users.splice(index, 1);

      admin_nsp.emit("client-disconnect", socket.username);
    }
  });
});
