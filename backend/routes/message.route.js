// routes/message.routes.js
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getUsersForSidebar,
} = require("../controllers/message.controller");
const { protectRoute } = require("../middleware/auth.middleware");

router.get("/users", protectRoute, getUsersForSidebar);
// Get messages between logged-in user & another user
router.get("/:id", protectRoute, getMessages);

// Send a message
router.post("/send/:id", protectRoute, sendMessage);

module.exports = router;
