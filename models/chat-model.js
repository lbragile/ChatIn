const mongoose = require("mongoose");
var db = require("../config/database");

var chatSchema = new mongoose.Schema({
  room: String,
  message: String,
  username: String,
  timeSent: String,
  dateSent: String,
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
