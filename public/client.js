var socket = io.connect("/chat");

socket.on("connect", function () {
  socket.emit("message_client", "Message: sent by client");
});

document.getElementById("chat").addEventListener("click", function () {
  console.log(socket.id);

  // hide the join button
  this.className = ".d-none";
  this.style.display = "none";

  let chat_title = document.querySelector("span");
  var date = new Date();
  var months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  var days = [
    "Monday",
    "Tuesday",
    "Wednsday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  chat_title.textContent = `Talking to: admin ~ ${
    days[date.getDay()]
  } (${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()})`;
  document.getElementById("message").focus();

  socket.emit("join-room");
});

function emitMessage() {
  let message = document.getElementById("message").value;

  if (message.length > 0) {
    socket.emit("message-sent", {
      message,
      id: socket.id,
    });
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

function padNum(num) {
  return (num < 10 ? "0" : "") + num;
}

// set value on all clients
socket.on("message-received", (data) => {
  var message_div = document.createElement("div");
  var message_title = document.createElement("span");

  message_div.innerHTML = data.message;

  var bg_color, box_pseudo, margin_x, title;
  var date = new Date();
  var seconds = padNum(date.getSeconds());
  var minutes = padNum(date.getMinutes());
  var hours = padNum(date.getHours());

  date_string = ` @ ${hours}:${minutes}:${seconds}`;
  if (socket.id == data.id) {
    bg_color = "bg-secondary";
    box_pseudo = "box-right";
    margin_x = "mr-4 ml-auto";
    title = "You" + date_string;
  } else {
    bg_color = "bg-dark";
    box_pseudo = "box-left";
    margin_x = "ml-4";
    title = data.sender + date_string;
  }

  message_title.innerHTML = title;
  message_title.style["fontWeight"] = "bold";
  message_title.className = "d-block text-center";

  message_div.className = `my-1 ${margin_x} box ${box_pseudo} ${bg_color} text-light text-left col`;
  let chat_area = document.getElementById("chat-area");
  message_div.prepend(message_title);
  chat_area.append(message_div);

  let message = document.getElementById("message");
  message.value = "";
  message.focus();
});
