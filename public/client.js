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

// set value on all clients
client.on("message-clients", (message) => {
  var divToCreate = document.createElement("div");
  divToCreate.innerHTML = message;
  document.getElementById("message").parentNode.appendChild(divToCreate);
});
