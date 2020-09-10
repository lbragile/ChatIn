const User = require("../models/users-model");
const bcrypt = require("bcrypt");

var login_get = (req, res) => {
  if (req.cookies["client"]) {
    res.status(302).redirect("/chat?username=" + req.cookies["client"]);
  } else {
    res.render("login", { message: "" });
  }
};

var login_post = async (req, res) => {
  var { username, password } = req.body;

  // SELECT username, password FROM User WHERE username = username
  var result = await User.findOne(
    { username },
    { username: 1, password: 1, _id: 0 }
  )
    .lean()
    .exec(); // exec gives a promise

  // admin password is public here so no need to worry about env variables
  if (username.toLowerCase() == "admin" && password === "pass1234") {
    res.cookie("admin", username, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      signed: false,
    });
    res.status(302).redirect("/admin");
  } else if (!result || !(await bcrypt.compare(password, result.password))) {
    res.render("login", { message: "Username & Password do not match" });
  } else if (result) {
    res.cookie("client", username, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      signed: false,
    });
    res.status(302).redirect("/chat?username=" + username);
  }
};

module.exports = {
  login_get,
  login_post,
};
