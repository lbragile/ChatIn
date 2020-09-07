function chatDetails(username, date_title) {
  var date_info = document.getElementById("date-info");
  var user_info = document.getElementById("user-info");

  user_info.textContent = username;

  if (date_title == undefined) {
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

    date_info.textContent = `${days[date.getDay()]} (${date.getDate()}-${
      months[date.getMonth()]
    }-${date.getFullYear()})`;
  } else {
    date_info.textContent = `${date_title}`;
  }
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

  var bg_color, margin_x, title;
  if (username == data.username) {
    bg_color = "bg-secondary";
    margin_x = "mr-1 ml-auto";
    title = "You" + data.time;

    // clear the message from the message field only for sender
    let message = document.getElementById("message");
    message.value = "";
    message.focus();
  } else {
    bg_color = "bg-dark";
    margin_x = "ml-1";
    title = data.username + data.time;
  }

  message_title.innerHTML = title;
  message_title.style["fontWeight"] = "bold";
  message_title.className = "d-block text-center";

  message_div.className = `my-1 ${margin_x} box ${bg_color} text-light text-left col`;
  let message_area = document.getElementById("message-area");
  message_div.prepend(message_title);
  message_area.append(message_div);
}

function addUserToAdminList(username) {
  var list_item = document.createElement("li");
  list_item.id = username;
  var item_text = document.createTextNode(username);
  list_item.appendChild(item_text);
  document.getElementById("joined-users").appendChild(list_item);
}

export { chatDetails, emitMessage, padNum, messageDisplay, addUserToAdminList };
