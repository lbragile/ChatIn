const express = require("express");
const socket = require("socket.io");
const path = require("path");

var Chat = require("./models/chat-model");
var User = require("./models/users-model");

var homeRoutes = require("./routes/homeRoutes");
var chatRoutes = require("./routes/chatRoutes");
var adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json({ limit: "1mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static(path.join(__dirname, "public"))); // use all files defined in public folder
app.set("view engine", "ejs"); // set the engine

app.use(homeRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);

const chat_nsp = io.of("/chat"),
  admin_nsp = io.of("/admin");

function listClients(room_name) {
  chat_nsp.in(room_name).clients((error, clients) => {
    if (error) throw error;
    console.log(clients);
  });
}

// save the message information in MongoDB
function saveInMongoDB(object) {
  object.save((err) => {
    if (err) {
      return console.error(err);
    }
  });
}

// CLIENT
chat_nsp.on("connect", (socket) => {
  var url = new URL(socket.request.headers.referer);
  socket.username = url.searchParams.get("username");

  // save them to database
  const user = new User({
    username: socket.username,
  });
  saveInMongoDB(user);

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
    });

    socket.emit("chat-entered");
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    var room = Object.keys(socket.rooms)[1];
    chat_nsp.in(room).emit("message-received", data);

    // prepare for storing message
    var date = new Date();
    var day = ("0" + date.getDate()).slice(-2),
      month = ("0" + (date.getMonth() + 1)).slice(-2),
      year = date.getFullYear();
    var date_string = `${day}-${month}-${year}`;

    const chat = new Chat({
      room: room,
      message: data.message,
      username: data.username,
      timeSent: data.time,
      dateSent: date_string,
    });

    saveInMongoDB(chat);
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

      admin_nsp.emit("client-disconnect", socket.username);
    }
  });
});

// remove collection's documents
// Chat.collection.remove(function (err) {
//   if (err) throw err;
//   // collection is now empty but not deleted
// });
