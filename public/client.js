import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/chat");

function scrollToBottomOfChat() {
  // scroll to the bottom of chat area such that new message is seen
  let message_area = document.getElementById("message-area");
  message_area.scrollTop = message_area.scrollHeight;
}

socket.on("connect", () => {
  var queryParams = new URLSearchParams(window.location.search);
  socket.username = queryParams.get("username");

  var chat_window = document.getElementById("chat-container");
  var chat_button = document.getElementById("chat-button");
  var close_chat = document.getElementById("close-chat");
  if (queryParams.get("id") == undefined) {
    chat_button.addEventListener("click", function () {
      // hide the join button
      this.style.display = "none";
      chat_window.style.display = "block";

      socket.emit("chat");
    });

    close_chat.addEventListener("click", function () {
      // hide the chat window
      chat_button.style.display = "block";
      chat_window.style.display = "none";
    });
  } else {
    socket.username = "admin";
    chat_window.style.display = "block";
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

  scrollToBottomOfChat();
});

// sending message
document.getElementById("send").addEventListener("click", function () {
  SharedFunc.emitMessage(socket);
});

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    SharedFunc.emitMessage(socket);
  }
});

// typing
document.getElementById("message").addEventListener("focus", function () {
  socket.emit("typing", socket.username);
});

// stop typing
document.getElementById("message").addEventListener("blur", function () {
  socket.emit("stop-typing");
});

socket.on("message-received", (data) => {
  SharedFunc.messageDisplay(socket.username, data);

  scrollToBottomOfChat();
});

socket.on("typing", (username) => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = `${username} is typing...`;
});

socket.on("stop-typing", () => {
  var typing_info = document.querySelector("#typing");
  typing_info.textContent = "";
});
