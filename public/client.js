import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/chat");

var chat_clicked = false;

socket.on("connect", () => {
  var queryParams = new URLSearchParams(window.location.search);
  socket.username = queryParams.get("username");

  if (!window.location.href.includes("id=")) {
    document.getElementById("chat").addEventListener("click", function () {
      // hide the join button
      this.className = ".d-none";
      this.style.display = "none";

      chat_clicked = true;
      socket.emit("chat");
    });
  } else {
    SharedFunc.chatDetails(socket.username); // "talking to {client}"
    socket.username = "admin";
    chat_clicked = true;
  }
});

socket.on("chat-entered", () => {
  SharedFunc.chatDetails("admin");
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

socket.on("typing", (username) => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = `${username} is typing...`;
});

socket.on("stop-typing", () => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = "";
});
