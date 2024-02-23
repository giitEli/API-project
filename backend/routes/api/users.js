const express = require("express");
const bcrypt = require("bcryptjs");
const { setTokenCookie} = require("../../utils/auth");
const { User } = require("../../db/models");
const {
  validateSignupBody,
  signupCustomValidator,
} = require("../../utils/validators");
const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  const users = await User.findAll();
  return res.json(users);
});

// Sign up
router.post(
  "/",
  validateSignupBody,
  signupCustomValidator,
  async (req, res) => {
    const { firstName, lastName, email, password, username } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      hashedPassword,
    });

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser,
    });
  }
);

module.exports = router;
