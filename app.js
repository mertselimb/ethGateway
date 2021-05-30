const express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  logger = require("morgan");

const indexRouter = require("./routes/index"),
  walletRouter = require("./routes/wallet");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/wallet", walletRouter);

module.exports = app;
