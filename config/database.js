const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/chat", { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("Database Connection Established"));

module.exports = db;
