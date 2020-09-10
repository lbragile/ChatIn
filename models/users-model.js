const mongoose = require("mongoose");
var db = require("../config/database");
const { hash } = require("bcrypt");

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
