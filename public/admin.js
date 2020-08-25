import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/admin");

socket.on("connect", function () {
  socket.username = "admin";
});

var chat_clicked = false;
socket.on("join-request", (username) => {
  SharedFunc.chatDetails(username);
  socket.emit("chat", username);
  chat_clicked = true;
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

socket.on("client-typing", (username) => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = `${username} is typing...`;
});

socket.on("client-stop-typing", () => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = ``;
});
