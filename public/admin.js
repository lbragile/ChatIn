import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/admin");

socket.on("connect", function () {
  socket.username = "admin";
});

// display the user in the admins window, when admin clicks on user connect to chat
socket.on("join-request", (data) => {
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
      window.open(`/chat?username=${data.username}&id=${data.id}`, "_blank");
    });
});

if (window.location.href.includes("id=")) {
  const urlParams = new URLSearchParams(window.location.search);
  const client_username = urlParams.get("username");
  SharedFunc.chatDetails(client_username);

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
}

socket.on("message-received", (data) => {
  SharedFunc.messageDisplay(socket.username, data);
});

socket.on("client-disconnect", (username) => {
  var li_to_delete = document.getElementById(username);
  li_to_delete.remove();
});
