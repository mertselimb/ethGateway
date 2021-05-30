const express = require("express"),
  Tx = require("ethereumjs-tx").Transaction,
  router = express.Router(),
  Web3 = require("web3");

// Leaving like this for easy testing. I know this isn't the best practice.

// Etherium test network
// const url = "https://ropsten.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
// Etherium main network
const url = "https://mainnet.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
const web3 = new Web3(url);
// Ropsten network wallets
const address1 = "0x3d1ebf179472bfF3892521971a8c33738324e68e";
const privateKey1 =
  "c99d72bf97b18d012e7d06fa671ad128db9b505c7b072ce3891180eb363a40cd";
const address2 = "0x1ce509bBdc65a63C2f18fa96D16Ca07f483b7ee8";
const privateKey2 =
  "0x9e12131cd0e5a2c3bdf80eb86f428d02a1b4e4042a61c089ef632ef8faeffd4b";

const unexpectedError = { error: "Unexpected error." };
const formatError = { error: "Wrong format" };

// Fetch transaction data on blocks
router.post("/fetch", async (req, res, next) => {
  if (req.body.startBlock) {
    const endBlock = req.body.endBlock
      ? req.body.endBlock
      : await web3.eth.getBlockNumber();

    const transactions = [];
    for (
      let blockIndex = parseInt(req.body.startBlock);
      blockIndex < parseInt(endBlock) + 1;
      blockIndex++
    ) {
      const block = await web3.eth.getBlock(blockIndex);
      console.log(
        blockIndex,
        "block.transactions.length",
        block.transactions.length
      );
      if (block || block.number) {
        for (const transactionHash of block.transactions) {
          const transaction = await web3.eth.getTransaction(transactionHash);
          if (parseFloat(transaction.value) > 0) {
            transactions.push(formatTx(transaction, block.timestamp, "ETH"));
          } else if (
            transaction.to === "0xdAC17F958D2ee523a2206206994597C13D831ec7"
          ) {
            transactions.push(formatTx(transaction, block.timestamp, "USDT"));
          }
        }
      } else {
        console.error(err);
        res.json(unexpectedError);
      }
    }
    res.json(transactions);
  } else {
    res.json(formatError);
  }
});

// This endpoint should accept transaction parameters,
// build it, sign it, and broadcast it to the network.
router.post("/send", async (req, res, next) => {
  if (req.body.privateKey && req.body.address && req.body.amount) {
    const sender = await web3.eth.accounts.privateKeyToAccount(
      req.body.privateKey
    );
    const addressCheck = await web3.utils.isAddress(req.body.address);
    if (sender.address && addressCheck) {
      web3.eth.getTransactionCount(sender.address, (err, count) => {
        if (err) {
          console.error(err);
          res.json(unexpectedError);
        } else {
          const TxObject = {
            nonce: web3.utils.toHex(count),
            to: req.body.address,
            value: web3.utils.toHex(req.body.amount),
            gasLimit: web3.utils.toHex(21000),
            gasPrice: web3.utils.toHex(web3.utils.toWei("10", "gwei")),
          };
          const tx = new Tx(TxObject, { chain: "ropsten" });
          tx.sign(Buffer.from(req.body.privateKey, "hex"));

          const serializedTransaction = tx.serialize();
          const raw = "0x" + serializedTransaction.toString("hex");

          web3.eth.sendSignedTransaction(raw, (err, txHash) => {
            if (err) {
              console.error(err);
              res.json(unexpectedError);
            } else {
              res.json({ txHash });
            }
          });
        }
      });
    } else if (!addressCheck) {
      res.json({ error: "Incorrect address" });
    } else {
      res.json(unexpectedError);
    }
  } else {
    res.json(formatError);
  }
});

// Get transaction data
router.post("/", async (req, res, next) => {
  if (req.body.transactionHash) {
    res.json(await web3.eth.getTransaction(req.body.transactionHash));
  } else {
    res.json(formatError);
  }
});

const formatTx = (transaction, timestamp, token) => {
  return {
    from: transaction.s,
    to: transaction.r,
    amount: transaction.value,
    token: token,
    timestamp: timestamp,
    blockNumber: transaction.blockNumber,
  };
};

module.exports = router;
