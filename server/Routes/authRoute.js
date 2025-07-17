const express = require("express");
const {
  login,
  getMe,
  logout,
  verifyToken,
} = require("../Controllers/Auth.controller");

const router = express.Router();

// Login route
router.post("/login", login);

// Get current user (protected route)
router.get("/me", verifyToken, getMe);

// Logout route
router.post("/logout", logout);

module.exports = router;
