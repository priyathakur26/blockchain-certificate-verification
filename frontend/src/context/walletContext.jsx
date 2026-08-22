
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";

import {
  CONTRACT_ADDRESS,
  ABI,
} from "../contracts/contract";

const WalletContext = createContext(null);

// =====================================
// SEPOLIA PUBLIC RPC
// =====================================

const SEPOLIA_RPC =
  "https://ethereum-sepolia-rpc.publicnode.com";

export function WalletProvider({ children }) {

  // =====================================
  // WALLET STATE
  // =====================================

  const [walletAddress, setWalletAddress] =
    useState("");

  const [provider, setProvider] =
    useState(null);

  const [signer, setSigner] =
    useState(null);

  const [contract, setContract] =
    useState(null);

  // Read-only Sepolia contract
  const [readOnlyContract, setReadOnlyContract] =
    useState(null);

  const [connecting, setConnecting] =
    useState(false);


  // =====================================
  // CREATE READ-ONLY SEPOLIA CONTRACT
  // =====================================

  useEffect(() => {

    const createReadOnlyContract = async () => {

      try {

        // IMPORTANT:
        // This does NOT use MetaMask.
        // This does NOT use localhost.
        // This does NOT use laptop IP.
        //
        // It connects directly to Ethereum Sepolia.

        const rpcProvider =
          new ethers.JsonRpcProvider(
            SEPOLIA_RPC
          );

        const network =
          await rpcProvider.getNetwork();

        console.log(
          "Read-only network:",
          network.chainId.toString()
        );

        if (
          network.chainId.toString() !==
          "11155111"
        ) {

          throw new Error(
            "RPC is not connected to Sepolia."
          );

        }

        const readContract =
          new ethers.Contract(
            CONTRACT_ADDRESS,
            ABI,
            rpcProvider
          );

        setReadOnlyContract(
          readContract
        );

        console.log(
          "Read-only Sepolia contract connected"
        );

        console.log(
          "Contract:",
          CONTRACT_ADDRESS
        );

      } catch (error) {

        console.error(
          "Failed to create read-only Sepolia contract:",
          error
        );

        setReadOnlyContract(null);

      }

    };

    createReadOnlyContract();

  }, []);


  // =====================================
  // SET CURRENT METAMASK ACCOUNT
  // =====================================

  const setCurrentAccount = async (
    account
  ) => {

    try {

      if (
        !window.ethereum ||
        !account
      ) {
        return null;
      }

      const browserProvider =
        new ethers.BrowserProvider(
          window.ethereum
        );

      const network =
        await browserProvider.getNetwork();

      console.log(
        "MetaMask Chain ID:",
        network.chainId.toString()
      );

      const currentSigner =
        await browserProvider.getSigner(
          account
        );

      const currentContract =
        new ethers.Contract(
          CONTRACT_ADDRESS,
          ABI,
          currentSigner
        );

      setWalletAddress(account);

      setProvider(
        browserProvider
      );

      setSigner(
        currentSigner
      );

      setContract(
        currentContract
      );

      return {
        walletAddress: account,
        provider: browserProvider,
        signer: currentSigner,
        contract: currentContract,
      };

    } catch (error) {

      console.error(
        "Failed to set current account:",
        error
      );

      return null;
    }
  };


  // =====================================
  // CONNECT METAMASK
  // =====================================

  const connect = async () => {

    try {

      setConnecting(true);

      if (!window.ethereum) {

        alert(
          "Please install MetaMask."
        );

        return null;
      }

      const accounts =
        await window.ethereum.request({
          method:
            "eth_requestAccounts",
        });

      if (
        !accounts ||
        accounts.length === 0
      ) {
        return null;
      }

      const account =
        accounts[0];

      return await setCurrentAccount(
        account
      );

    } catch (error) {

      console.error(
        "Wallet connection failed:",
        error
      );

      return null;

    } finally {

      setConnecting(false);

    }
  };


  // =====================================
  // CHECK EXISTING METAMASK CONNECTION
  // =====================================

  useEffect(() => {

    const checkConnection =
      async () => {

        if (!window.ethereum) {
          return;
        }

        try {

          const accounts =
            await window.ethereum.request({
              method:
                "eth_accounts",
            });

          if (
            !accounts ||
            accounts.length === 0
          ) {

            setWalletAddress("");
            setProvider(null);
            setSigner(null);
            setContract(null);

            return;
          }

          await setCurrentAccount(
            accounts[0]
          );

        } catch (error) {

          console.error(
            "Wallet connection check failed:",
            error
          );

        }

      };

    checkConnection();

  }, []);


  // =====================================
  // METAMASK ACCOUNT CHANGES
  // =====================================

  useEffect(() => {

    if (!window.ethereum) {
      return;
    }

    let lastAccount = "";

    const checkAccount = async () => {

      try {

        const accounts =
          await window.ethereum.request({
            method:
              "eth_accounts",
          });

        const currentAccount =
          accounts &&
          accounts.length > 0
            ? accounts[0]
            : "";

        if (
          currentAccount.toLowerCase() ===
          lastAccount.toLowerCase()
        ) {
          return;
        }

        console.log(
          "MetaMask account detected:",
          currentAccount
        );

        lastAccount =
          currentAccount;

        if (!currentAccount) {

          setWalletAddress("");
          setProvider(null);
          setSigner(null);
          setContract(null);

          return;
        }

        await setCurrentAccount(
          currentAccount
        );

      } catch (error) {

        console.error(
          "Account detection error:",
          error
        );

      }

    };

    checkAccount();

    const interval =
      setInterval(
        checkAccount,
        1000
      );

    return () => {
      clearInterval(interval);
    };

  }, []);


  // =====================================
  // CONTEXT VALUE
  // =====================================

  return (

    <WalletContext.Provider
      value={{

        // MetaMask
        walletAddress,
        provider,
        signer,
        contract,

        // Read-only Sepolia
        readOnlyContract,

        // Wallet connection
        connecting,
        connect,

      }}
    >

      {children}

    </WalletContext.Provider>

  );
}


// =====================================
// CUSTOM HOOK
// =====================================

export function useWallet() {

  return useContext(
    WalletContext
  );

}