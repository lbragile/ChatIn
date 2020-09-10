const express = require("express");
const socket = require("socket.io");
const path = require("path");
const cookieParser = require("cookie-parser");

var Chat = require("./models/chat-model");

var homeRoutes = require("./routes/homeRoutes");
var registerRoutes = require("./routes/registerRoutes");
var chatRoutes = require("./routes/chatRoutes");
var adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json({ limit: "1mb" })); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

var port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));
const io = socket(server);

app.use(express.static(path.join(__dirname, "public"))); // use all files defined in public folder
app.set("view engine", "ejs"); // set the engine

app.use(homeRoutes);
app.use("/register", registerRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);

const client_nsp = io.of("/chat"),
  admin_nsp = io.of("/admin");

function saveInMongoDB(object) {
  object.save((err) => {
    if (err) {
      return console.error(err);
    }
  });
}

function populateChat(room_name) {
  return Chat.find({ room: room_name }).lean().exec(); // exec gives a promise
}

admin_nsp.on("connect", (socket) => {
  var user_list = [];
  var id_list = [];
  client_nsp.clients((error, clients) => {
    if (error) throw error;
    clients.forEach((socket_id) => {
      id_list.push(socket_id);
      user_list.push(client_nsp.sockets[socket_id].username);
    });
    console.log(user_list);
    socket.emit("user-list", { users: user_list, ids: id_list });
  });
});

// CLIENT
client_nsp.on("connect", (socket) => {
  var url = new URL(socket.request.headers.referer);
  socket.username = url.searchParams.get("username");

  const room = "admin_" + socket.username;
  socket.join(room);

  if (url.searchParams.get("id") != undefined) {
    // re-write all previous messages (admin)
    populateChat(room)
      .then((messages) => {
        socket.emit("chat-entered", messages);
      })
      .catch((err) => console.log(err));
  }

  socket.on("chat", async () => {
    console.log(`Welcome user - ${socket.username}\n`);

    // re-write all previous messages (client)
    var messages = await populateChat(room);
    socket.emit("chat-entered", messages);
  });

  // broadcase message to all
  socket.on("message-sent", (data) => {
    client_nsp.in(room).emit("message-received", data);

    // prepare for storing message
    var date = new Date();
    var day = date.getDate(),
      month = date.getMonth(),
      year = date.getFullYear();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    saveInMongoDB(
      new Chat({
        room: room,
        message: data.message,
        username: data.username,
        timeSent: data.time,
        dateSent: `${dayNames[day]} (${day}-${monthNames[month]}-${year})`,
      })
    );
  });

  socket.on("typing", (username) => {
    socket.to(room).emit("typing", username);
  });

  socket.on("stop-typing", () => {
    socket.to(room).emit("stop-typing");
  });
});
