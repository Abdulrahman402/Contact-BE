const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const { validateUser, updateUser, User } = require("../Models/User");
const auth = require("../Middleware/auth");

router.get("/profile/me", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select("-password");

  res.send(user);
});

router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password ");

  res.send(user);
});

router.post("/SignUp", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already Registered");

  user = new User(
    _.pick(req.body, ["name", "email", "password", "gender", "DOB"])
  );

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const token = await user.generateAuthToken();

  await user.save();

  res.header("x-auth-token", token).send(_.pick(user, "email", "name"));
});

module.exports = router;
