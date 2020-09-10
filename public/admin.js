import * as SharedFunc from "./shared.js";

var socket = io.connect("/admin");

function addClient(users, ids) {
  users.forEach((username, index) => {
    SharedFunc.addUserToAdminList(username, ids[index]);
  });
}

// refresh keeps the list for admin
socket.on("user-list", (data) => {
  addClient(data.users, data.ids);
});

// socket.on("client-disconnect", (username) => {
//   var li_to_delete = document.getElementById(username);
//   li_to_delete.remove();
// });
