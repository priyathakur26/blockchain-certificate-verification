const hre = require("hardhat");

async function main() {
    const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const certificate = await hre.ethers.getContractAt(
        "CertificateVerification",
        contractAddress
    );

    const tx = await certificate.issueCertificate(
        "Priya Thakur",
        "CS2026001",
        "B.Tech CSE",
        "HASH123456",
        "QmExampleIpfsHash"
    );

    await tx.wait();

    console.log("✅ Certificate Issued Successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});