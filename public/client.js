const client = io();

document.getElementById("chat").addEventListener("click", function () {
  console.log(client.id);

  // hide the join button
  this.className = ".d-none";
  this.style.display = "none";

  client.emit("join-room", client.id);
});

function emitMessage() {
  let message = document.getElementById("message").value;
  if (message.length > 0) {
    client.emit("message-sent", { message, id: client.id });
  }
}

document.getElementById("send").addEventListener("click", function () {
  emitMessage();
});

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    emitMessage();
  }
});

// set value on all clients
client.on("message-sent", (data) => {
  var div = document.createElement("div");
  div.innerHTML = data.message;

  var bg_color, box_pseudo, margin_x;
  if (client.id == data.sender) {
    bg_color = "bg-secondary";
    box_pseudo = "box-right";
    margin_x = "mr-4 ml-auto";
  } else {
    bg_color = "bg-dark";
    box_pseudo = "box-left";
    margin_x = "ml-4";
  }

  div.className = `my-3 ${margin_x} box ${box_pseudo} ${bg_color} text-light text-left`;
  document.getElementById("input-area").parentNode.appendChild(div);
  document.getElementById("message").value = "";
});

client.on("users-joined", (data) => {
  let username = document.querySelector("span");
  let other_user = client.id == data.first ? data.second : data.first;
  username.textContent = "Talking to: " + other_user;
});
