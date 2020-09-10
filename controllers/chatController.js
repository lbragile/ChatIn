var chat_get = (req, res) => {
  if (!req.cookies["client"]) {
    res.render("login", { message: "Login first" });
  } else {
    let chat_type = req.query.id != undefined ? "admin" : "client";
    res.render("chat", { type: chat_type });
  }
};

module.exports = {
  chat_get,
};
