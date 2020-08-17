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
  var message_div = document.createElement("div");
  var message_title = document.createElement("span");

  message_div.innerHTML = data.message;

  var bg_color, box_pseudo, margin_x, title;
  if (client.id == data.sender) {
    bg_color = "bg-secondary";
    box_pseudo = "box-right";
    margin_x = "mr-4 ml-auto";
    title = "You";
  } else {
    bg_color = "bg-dark";
    box_pseudo = "box-left";
    margin_x = "ml-4";
    title = data.sender;
  }

  message_title.innerHTML = title;
  message_title.style["fontWeight"] = "bold";
  message_title.className = "d-block text-center";

  message_div.className = `my-1 ${margin_x} box ${box_pseudo} ${bg_color} text-light text-left col`;
  let chat_area = document.getElementById("chat-area");
  message_div.prepend(message_title);
  chat_area.append(message_div);
  document.getElementById("message").value = "";
});

client.on("users-joined", (data) => {
  let username = document.querySelector("span");
  let other_user = client.id == data.first ? data.second : data.first;
  username.textContent = "Talking to: " + other_user;
});
