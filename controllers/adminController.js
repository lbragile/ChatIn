var admin_get = (req, res) => {
  if (!req.cookies["admin"]) {
    res.render("login", { message: "Login first" });
  } else {
    res.render("admin");
  }
};

module.exports = {
  admin_get,
};
