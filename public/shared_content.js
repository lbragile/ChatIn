function chatDetails(username) {
  var chat_title = document.getElementById("title-info");
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
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  chat_title.textContent = `Talking to: ${username} ~ ${
    days[date.getDay()]
  } (${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()})`;
  // document.getElementById("message").focus();
}

function padNum(num) {
  return (num < 10 ? "0" : "") + num;
}

function emitMessage(socket) {
  let message = document.getElementById("message").value;

  var date = new Date();
  var seconds = padNum(date.getSeconds());
  var minutes = padNum(date.getMinutes());
  var hours = padNum(date.getHours());

  var time_string = ` @ ${hours}:${minutes}:${seconds}`;

  if (message.length > 0) {
    socket.emit("message-sent", {
      message,
      username: socket.username,
      id: socket.id,
      time: time_string,
    });
  }
}

function messageDisplay(username, data) {
  var message_div = document.createElement("div");
  var message_title = document.createElement("span");

  message_div.innerHTML = data.message;

  var bg_color, box_pseudo, margin_x, title;
  if (username == data.username) {
    bg_color = "bg-secondary";
    box_pseudo = "box-right";
    margin_x = "mr-4 ml-auto";
    title = "You" + data.time;

    // clear the message from the message field only for sender
    let message = document.getElementById("message");
    message.value = "";
    message.focus();
  } else {
    bg_color = "bg-dark";
    box_pseudo = "box-left";
    margin_x = "ml-4";
    title = data.username + data.time;
  }

  message_title.innerHTML = title;
  message_title.style["fontWeight"] = "bold";
  message_title.className = "d-block text-center";

  message_div.className = `my-1 ${margin_x} box ${box_pseudo} ${bg_color} text-light text-left col`;
  let chat_area = document.getElementById("chat-area");
  message_div.prepend(message_title);
  chat_area.append(message_div);
}

function addUserToAdminList(username) {
  var list_item = document.createElement("li");
  list_item.id = username;
  var item_text = document.createTextNode(username);
  list_item.appendChild(item_text);
  document.getElementById("joined-users").appendChild(list_item);
}

export { chatDetails, emitMessage, padNum, messageDisplay, addUserToAdminList };
