const express = require("express");
const multer = require("multer");
const _ = require("lodash");

const router = express.Router();

const { User } = require("../Models/User");
const auth = require("../Middleware/auth");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "Image");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer(
  {
    storage: storage,
    limits: {
      fileSize: 3000000
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error("Please upload an image"));
      }
      cb(undefined, true);
    }
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message });
  }
);

router.post(
  "/uploadProfPic",
  auth,
  upload.single("upload"),
  async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    const pictures = await User.findOne({ _id: req.user._id }).select(
      "profPic"
    );

    if (pictures) {
      await User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { profPic: null } },
        { new: true }
      );
    }
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { profPic: req.file.path } },
      { new: true }
    );
    res.send(_.pick(user, "name", "email", "profPic"));
  }
);

router.get("/getProfPic", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id }).select("-password");
  const picture = await User.findOne({ _id: user._id }).select("profPic");

  if (!user || !picture) {
    throw new Error();
  }

  res.json(picture);
});

router.put("/removeProfPic", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  if (req.body.action === "Delete") {
    await User.findOneAndUpdate(
      { _id: user._id },
      { $set: { profPic: null } },
      { new: true }
    );
  }

  res.send(_.pick(user, "name", "email"));
});

module.exports = router;
