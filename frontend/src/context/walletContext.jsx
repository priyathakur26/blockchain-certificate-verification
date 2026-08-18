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

  // MetaMask contract
  const [contract, setContract] =
    useState(null);

  // Read-only blockchain contract
  const [readOnlyContract, setReadOnlyContract] =
    useState(null);

  const [connecting, setConnecting] =
    useState(false);


  // =====================================
  // CREATE READ-ONLY CONTRACT
  // =====================================

  useEffect(() => {

    const createReadOnlyContract = async () => {

      try {

        /*
         * IMPORTANT
         *
         * This provider connects directly to
         * the Hardhat Local RPC.
         *
         * No MetaMask is required.
         */

        const rpcProvider =
          new ethers.JsonRpcProvider(
            "http://192.168.0.100:8545"
          );

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
          "Read-only blockchain contract connected"
        );

      } catch (error) {

        console.error(
          "Failed to create read-only contract:",
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

    const handleAccountsChanged =
      async (accounts) => {

        console.log(
          "MetaMask account changed:",
          accounts
        );

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

        const newAccount =
          accounts[0];

        await setCurrentAccount(
          newAccount
        );
      };

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    return () => {

      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

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

        // Read-only blockchain
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