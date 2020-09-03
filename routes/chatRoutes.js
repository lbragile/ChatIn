const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

router.get("/", chatController.chat_get);

module.exports = router;
