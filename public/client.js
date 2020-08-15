const client = io();

document.getElementById("join").addEventListener("click", function () {
  console.log(client.id);
  this.style.display = "none";
  client.emit("join-room", client.id);
});

document.getElementById("send").addEventListener("click", function () {
  let message = document.getElementById("message").value;
  client.emit("message-sent", { message, id: client.id });
});

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    let message = document.getElementById("message").value;
    client.emit("message-sent", { message, id: client.id });
  }
});

// set value on all clients
client.on("message-sent", (data) => {
  var div = document.createElement("div");
  div.innerHTML = data.message;

  var bg_color, text_color, text_align;
  if (client.id == data.sender) {
    bg_color = "bg-light";
    text_color = "text-dark";
    text_align = "text-right";
  } else {
    bg_color = "bg-dark";
    text_color = "text-light";
    text_align = "text-left";
  }
  div.className = `my-1 px-2 ${bg_color} ${text_color} ${text_align}`;

  document.getElementById("input-area").parentNode.appendChild(div);
  document.getElementById("message").value = "";
});
