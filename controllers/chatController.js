var chat_get = (req, res) => {
  if (req.query.id != undefined) {
    res.render("admin_chat");
  } else {
    res.render("chat");
  }
};

module.exports = {
  chat_get,
};
