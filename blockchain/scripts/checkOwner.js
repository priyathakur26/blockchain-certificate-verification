const { ethers } = require("hardhat");

async function main() {
  const contract = await ethers.getContractAt(
    "CertificateVerification",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );

  const owner = await contract.owner();

  console.log("Contract Owner:", owner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});