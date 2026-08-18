const hre = require("hardhat");

async function main() {
    console.log("Deploying contract...");

    const Certificate = await hre.ethers.getContractFactory("CertificateVerification");

    const certificate = await Certificate.deploy();

    await certificate.waitForDeployment();

    console.log("Contract deployed to:", await certificate.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});