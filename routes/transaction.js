const express = require("express"),
  Tx = require("ethereumjs-tx").Transaction,
  router = express.Router(),
  Web3 = require("web3");

const url = "https://ropsten.infura.io/v3/82ca06dd24474153b6e8518663d1b5b1";
const web3 = new Web3(url);

const address1 = "0x3d1ebf179472bfF3892521971a8c33738324e68e";
const privateKey1 =
  "c99d72bf97b18d012e7d06fa671ad128db9b505c7b072ce3891180eb363a40cd";
const address2 = "0x1ce509bBdc65a63C2f18fa96D16Ca07f483b7ee8";
const privateKey2 =
  "0x9e12131cd0e5a2c3bdf80eb86f428d02a1b4e4042a61c089ef632ef8faeffd4b";

const unexpectedError = { error: "Unexpected error." };

router.post("/fetch", async (req, res, next) => {
  if (req.body.startBlock) {
    const startBlock = await web3.eth.getBlock(req.body.startBlock);
    const transactions = [];
    for (const transactionHash of startBlock.transactions) {
      const transaction = await web3.eth.getTransaction(transactionHash);
      transactions.push({ ...transaction });
    }
    res.json(transactions);
  } else {
    res.send("Wrong format");
  }
});

router.post("/send", async (req, res, next) => {
  const sender = await web3.eth.accounts.privateKeyToAccount(
    req.body.privateKey
  );
  if (sender.address) {
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
  } else {
    console.error(sender);
    res.json(unexpectedError);
  }
});

module.exports = router;
