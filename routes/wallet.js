const express = require("express"),
  router = express.Router(),
  Web3 = require("web3");

// Leaving like this for easy testing. I know this isn't the best practice.

// Etherium test network
// const url = "https://ropsten.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
// Etherium main network
const url = "https://mainnet.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
const web3 = new Web3(url);

// This endpoint should generate an ethereum wallet ‘private key’ and ‘address’
router.get("/new", async (req, res, next) => {
  const wallet = await web3.eth.accounts.create();
  res.json(wallet);
});

module.exports = router;
