const express = require("express"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  logger = require("morgan");

const indexRouter = require("./routes/index"),
  walletRouter = require("./routes/wallet"),
  transactionRouter = require("./routes/transaction");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/wallet", walletRouter);
app.use("/transaction", transactionRouter);

module.exports = app;
