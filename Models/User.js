const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const keys = require("../Config/keys");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    profPic: {
      type: String
    },
    gender: {
      type: String,
      required: true
    },
    DOB: {
      type: Date,
      required: true
    }
  },

  { timestamps: true }
);

userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign({ _id: this._id }, keys.tokenSecretKey);
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    name: joi.string().required(),
    email: joi
      .string()
      .required()
      .email(),
    password: joi
      .string()
      .required()
      .min(6)
      .max(12),
    gender: joi.string().required(),
    DOB: joi.date().required()
  };
  return joi.validate(user, schema);
}

function updateUser(user) {
  const schema = {
    name: joi.string(),
    newName: joi.string(),
    password: joi.string(),
    newPW: joi
      .string()
      .min(6)
      .max(12),
    gender: joi.string(),
    DOB: joi.date()
  };
  return joi.validate(user, schema);
}

module.exports = {
  User,
  validateUser,
  updateUser,
  userSchema
};
