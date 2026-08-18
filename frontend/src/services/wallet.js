import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contracts/contract";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      return null;
    }

    const account = accounts[0];

    const provider = new ethers.BrowserProvider(
      window.ethereum
    );

    const signer = await provider.getSigner(account);

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      signer
    );

    return {
      walletAddress: account,
      provider,
      signer,
      contract,
    };

  } catch (error) {
    console.error("Wallet connection failed:", error);
    return null;
  }
};