const client = io();

document.getElementById("join").addEventListener("click", function () {
  console.log(client.id);
  this.style.display = "none";
  client.emit("join-room", client.id);
});

document.getElementById("send").addEventListener("click", function () {
  emitMessage();
});

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    emitMessage();
  }
});

function emitMessage() {
  let message = document.getElementById("message").value;
  if (message.length > 0) {
    client.emit("message-sent", { message, id: client.id });
  }
}

// set value on all clients
client.on("message-sent", (data) => {
  var div = document.createElement("div");
  div.innerHTML = data.message;

  var bg_color, text_color, text_align;
  if (client.id == data.sender) {
    bg_color = "bg-secondary";
    text_align = "text-right";
    box_pseudo = "box-right";
    margin_x = "mr-4 ml-auto";
  } else {
    bg_color = "bg-dark";
    text_align = "text-left";
    box_pseudo = "box-left";
    margin_x = "ml-4";
  }
  div.className = `my-3 ${margin_x} box ${box_pseudo} ${bg_color} text-light ${text_align}`;

  document.getElementById("input-area").parentNode.appendChild(div);

  document.getElementById("message").value = "";
});
