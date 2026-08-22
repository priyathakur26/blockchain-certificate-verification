require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
  );

  const network = await provider.getNetwork();

  console.log("Chain ID:", network.chainId.toString());
  console.log("Network:", network.name);

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY,
    provider
  );

  const balance = await provider.getBalance(wallet.address);

  console.log("Wallet:", wallet.address);
  console.log(
    "Sepolia balance:",
    ethers.formatEther(balance),
    "ETH"
  );
}

main().catch(console.error);