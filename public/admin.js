import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/admin");

socket.on("connect", function () {
  socket.username = "admin";
});

var chat_clicked = false;

// display the user in the admins window, when admin clicks on user connect to chat
socket.on("join-request", (data) => {
  chat_clicked = true;

  // make sure not to add user if re-connected
  var ul = document.querySelector("ul");
  var li_arr = Array.from(ul.childNodes);
  var li_text = [];
  li_arr.forEach((element) => {
    li_text.push(element.innerHTML);
  });

  // add clients to the connected user list
  if (!li_text.includes(data.username)) {
    SharedFunc.addUserToAdminList(data.username);
  }

  // make each clickable (add event to the last element to insure only 1 event per element)
  document
    .querySelector("ul")
    .lastElementChild.addEventListener("click", () => {
      window.open(
        `/admin?chat=1&username=${data.username}&id=${data.id}`,
        "_blank"
      );
    });
});

if (window.location.href.includes("chat=1")) {
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
}

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

socket.on("client-disconnect", (username) => {
  var li_to_delete = document.getElementById(username);
  li_to_delete.remove();
});
