require("express-async-errors");
const express = require("express");
const winston = require("winston");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const keys = require("./Config/keys");
const user = require("./Routes/user");
const auth = require("./Routes/auth");

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

const corsOptions = {
  exposedHeaders: "x-auth-token"
};

app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use("/api/user", user);
app.use("/api/user", auth);

module.exports = server;
