const express = require("express"),
  router = express.Router(),
  Web3 = require("web3");

const url = "https://mainnet.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
const web3 = new Web3(url);

/* GET home page. */
router.get("/new", async (req, res, next) => {
  const wallet = await web3.eth.accounts.create();
  res.json(wallet);
});

module.exports = router;
