const express = require("express");
const router = express.Router();
const _ = require("lodash");
const bcrypt = require("bcryptjs");

const { validateUser, updateUser, User } = require("../Models/User");
const auth = require("../Middleware/auth");

// My Profile
router.get("/profile/me", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select("-password");

  res.send(user);
});

// User Profile
router.get("/:id", auth, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password ");

  res.send(user);
});

// Search
router.get("/search/user", auth, async (req, res, next) => {
  const page = req.query.page;
  const perPage = 20;
  const query = req.query.search;

  // search for a User
  const user = await User.find({
    name: { $regex: query, $options: "i" }
  })
    .select("-password")

    // pagination
    .limit(perPage)
    .skip((page - 1) * perPage);

  res.send(user);
});

// Register
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

// Change Password
router.put("/ChangePassword", auth, async (req, res, next) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ _id: req.user._id });
  const oldPW = await bcrypt.compare(req.body.oldPW, user.password);
  if (!oldPW) return res.status(400).send("Invalid old password");

  const newUser = await User.findByIdAndUpdate(
    req.user._id,
    { password: req.body.newPW },
    { new: true }
  );

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newUser.password, salt);

  await user.save();

  res.send(_.pick(user, ["name", "email", "profPic"]));
});

// Change Name
router.put("/ChangeName", auth, async (req, res, next) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.newName },
    { new: true }
  );
  await user.save();

  res.send(_.pick(user, ["name", "email", "profPic"]));
});

// Change Gender
router.put("/ChangeGender", auth, async (req, res, next) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { gender: req.body.gender } },
    { new: true }
  );
  res.send(_.pick(user, ["name", "email", "profPic"]));
});

// Change Date Of Birth
router.put("/ChangeDOB", auth, async (req, res, next) => {
  const { error } = updateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { DOB: req.body.DOB } },
    { new: true }
  );
  res.send(_.pick(user, ["name", "email", "profPic"]));
});

module.exports = router;
