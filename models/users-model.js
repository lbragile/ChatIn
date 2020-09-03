const mongoose = require("mongoose");
var db = require("../config/database");

var userSchema = new mongoose.Schema({
  username: String,
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
