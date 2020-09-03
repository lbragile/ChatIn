const User = require("../models/users-model");

var login_get = (req, res) => {
  res.render("login", { message: "" });
};

var login_post = (req, res) => {
  var username = req.body.username.toLowerCase();
  User.exists({ username: username }).then((result) => {
    if (!result) {
      // user does not exist
      if (username.indexOf(" ") >= 0) {
        res.render("login", { message: "Remove space" });
      } else {
        if (username != "admin") {
          res.status(302).redirect("/chat?username=" + username);
        } else {
          res.status(302).redirect("/admin");
        }
      }
    } else {
      // user exists
      res.render("login", { message: "Username exists" });
    }
  });
};

module.exports = {
  login_get,
  login_post,
};
