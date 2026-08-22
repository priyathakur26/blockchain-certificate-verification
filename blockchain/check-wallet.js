require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);

  console.log("Deployment wallet address:");
  console.log(wallet.address);
}

main();