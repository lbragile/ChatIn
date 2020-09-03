const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");

router.get("/", homeController.login_get);
router.post("/", homeController.login_post);

module.exports = router;
