const User = require("../models/users-model");
const bcrypt = require("bcrypt");

var register_get = (req, res) => {
  res.render("register", { message: "" });
};

var register_post = async (req, res) => {
  var { username, password, confirm_password } = req.body;

  let hash_password = await bcrypt.hash(password, 10);

  if (password != confirm_password) {
    return res.render("register", { message: "Password mismatch" });
  }

  var result = await User.findOne({ username, password: hash_password })
    .lean()
    .exec(); // exec gives a promise

  if (!result) {
    if (username.indexOf(" ") >= 0) {
      res.render("register", { message: "Remove space in username" });
    } else if (username.toLowerCase() == "admin") {
      res.render("register", { message: "Username is taken" });
    } else {
      // save to database
      let user = new User({ username, password: hash_password });
      user.save((err) => {
        if (err) {
          return console.error(err);
        }
      });

      res.status(302).redirect("/");
    }
  } else {
    res.status(302).redirect("/");
  }
};

module.exports = {
  register_get,
  register_post,
};
