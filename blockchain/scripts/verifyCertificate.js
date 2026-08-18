const hre = require("hardhat");

async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const certificate = await hre.ethers.getContractAt(
        "CertificateVerification",
        contractAddress
    );

    const isValid = await certificate.verifyCertificate(
        "CS2026001",
        "HASH123456"
    );

    console.log("Certificate Valid:", isValid);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});