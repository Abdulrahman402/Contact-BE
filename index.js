require("express-async-errors");
const express = require("express");
const winston = require("winston");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const corsOptions = {
  exposedHeaders: "x-auth-token"
};

app.use(cors(corsOptions));
app.use(cors());

app.use("/Image", express.static("Image"));
const keys = require("./Config/keys");
const user = require("./Routes/user");
const auth = require("./Routes/auth");
const friend = require("./Routes/friends");
const image = require("./Routes/image");

mongoose
  .connect(keys.mongoURI)
  .then(() => console.log("Connected to Book-Store DB"))
  .catch(err => console.log("Error while connecting DB", err));

const port = process.env.PORT || 1000;

const server = app.listen(port, () => {
  winston.info(`Listening on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(express.json());
app.use("/api/user", user);
app.use("/api/user", auth);
app.use("/api/friend", friend);
app.use("/api/image", image);

module.exports = server;
