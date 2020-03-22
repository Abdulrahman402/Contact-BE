const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const friendsSchema = new Schema(
  {
    requester: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      status: Number
    },
    recipient: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      status: Number
    }
  },
  { timestamps: true }
);

const Friends = mongoose.model("Friends", friendsSchema);

module.exports = Friends;
