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
    socket.username = "admin";
    chat_clicked = true;
  }
});

socket.on("chat-entered", (messages) => {
  var username_title = "admin";
  if (socket.username == "admin") {
    username_title = new URLSearchParams(window.location.search).get(
      "username"
    );
  }

  SharedFunc.chatDetails(username_title);

  messages.forEach((element) => {
    var previous_date = element.dateSent;

    let details = {
      message: element.message,
      username: element.username,
      id: element.id,
      time: element.timeSent,
    };

    // print the new date title information
    if (previous_date != element.dateSent) {
      SharedFunc.chatDetails(username_title, element.dateSent);
    }

    SharedFunc.messageDisplay(socket.username, details);
  });
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
