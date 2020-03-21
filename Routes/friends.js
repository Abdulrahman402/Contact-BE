const express = require("express");

const router = express.Router();

const { User } = require("../../Models/User");
const { Friends } = require("../../Models/Friend");

// Add Friend
router.post("/addUser/:id", auth, async (req, res) => {
  const requester = await User.findOne({ _id: req.user._id });
  const recipient = await User.findOne({ _id: req.params.id });

  if (req.body.action === "Add") {
    const reqFriend = new Friends({
      requester: {
        status: 1,
        id: requester._id
      },
      recipient: {
        status: 2,
        id: recipient._id
      }
    });

    await reqFriend.save();
  }

  res.send();
});

// Accept Friend
router.put("/acceptUser/:id", auth, async (req, res) => {
  const requester = await User.findOne({ _id: req.params.id });
  const recipient = await User.findOne({ _id: req.user._id });

  if (req.body.action === "Accept") {
    await Friends.findOneAndUpdate(
      { "requester.id": requester._id, "requester.status": 1 },
      {
        $set: {
          "requester.status": 3
        }
      },
      { new: true }
    );

    await Friends.findOneAndUpdate(
      { "recipient.id": recipient._id, "recipient.status": 2 },
      {
        $set: {
          "recipient.status": 3
        }
      },
      { new: true }
    );
  }

  res.send();
});

// Reject Request
router.delete("/rejectRequest/:id", auth, async (req, res) => {
  const requester = await User.findOne({ _id: req.params.id });
  const recipient = await User.findOne({ _id: req.user._id });

  if (req.body.action === "Delete request") {
    await Friends.findOneAndRemove({
      "requester.id": requester._id,
      "recipient.id": recipient._id
    });
  }

  res.send();
});

// Remove Friends
router.delete("/removeUser/:id", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const removedUser = await User.findOne({ _id: req.params.id });

  if (req.body.action === "Remove friend") {
    await Friends.findOneAndRemove({
      $or: [
        {
          "requester.id": user._id,
          "recipient.id": removedUser._id,
          "requester.status": 3,
          "recipient.status": 3
        },
        {
          "requester.id": removedUser._id,
          "recipient.id": user._id,
          "requester.status": 3,
          "recipient.status": 3
        }
      ]
    });
  }
  res.send();
});

// All Friends
router.get("/allFriends", auth, async (req, res) => {
  const page = req.query.page;
  const perPage = 20;
  const query = req.query.search;

  if (!page && !query) {
    const requestedFriends = await Friends.find({
      $or: [
        { "requester.id": req.user._id, "requester.status": 3 },
        { "recipient.id": req.user._id, "requester.status": 3 }
      ]
    }).select("requester recipient");

    const search = requestedFriends.map(friend => {
      if (friend.requester.id != req.user._id) return friend.requester.id;

      return friend.recipient.id;
    });

    res.send(search);
  }
});
