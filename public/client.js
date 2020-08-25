import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/chat");

// socket.on("connect", function () {
// });

var chat_clicked = false;
document.getElementById("chat").addEventListener("click", function () {
  // hide the join button
  this.className = ".d-none";
  this.style.display = "none";

  chat_clicked = true;
  socket.emit("chat");
});

socket.on("chat-entered", (username) => {
  SharedFunc.chatDetails("admin");
  socket.username = username;
});

// sending message
document.getElementById("send").addEventListener("click", function () {
  if (chat_clicked) {
    SharedFunc.emitMessage(socket);
  }
});

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && chat_clicked) {
    SharedFunc.emitMessage(socket);
  }
});

// typing
document.getElementById("message").addEventListener("focus", function () {
  if (chat_clicked) {
    socket.emit("typing", socket.username);
  }
});

// stop typing
document.getElementById("message").addEventListener("blur", function () {
  if (chat_clicked) {
    socket.emit("stop-typing");
  }
});

socket.on("message-received", (data) => {
  SharedFunc.messageDisplay(socket.username, data);
});

socket.on("admin-typing", (username) => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = `${username} is typing...`;
});

socket.on("admin-stop-typing", () => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = ``;
});
