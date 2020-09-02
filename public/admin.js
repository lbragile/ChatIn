import * as SharedFunc from "./shared_content.js";

var socket = io.connect("/admin");

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

socket.on("client-disconnect", (username) => {
  var li_to_delete = document.getElementById(username);
  li_to_delete.remove();
});
