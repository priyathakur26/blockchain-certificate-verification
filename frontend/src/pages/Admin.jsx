import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

export default function Admin() {
  const {
    walletAddress,
    contract,
    connecting,
    connect,
  } = useWallet();

  // =====================================
  // CERTIFICATE FORM
  // =====================================

  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [course, setCourse] = useState("");
  const [certificateHash, setCertificateHash] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");

  // =====================================
  // TRANSACTION
  // =====================================

  const [loading, setLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] =
    useState("idle");
  const [transactionHash, setTransactionHash] =
    useState("");

  // =====================================
  // NOTIFICATIONS
  // =====================================

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // =====================================
  // WALLET
  // =====================================

  const [walletBalance, setWalletBalance] =
    useState("0.0000");

  // =====================================
  // ADMIN ACCESS
  // =====================================

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] =
    useState(false);

  // =====================================
  // CERTIFICATE MANAGEMENT
  // =====================================

  const [certificates, setCertificates] = useState([]);
  const [certificateLoading, setCertificateLoading] =
    useState(false);
  const [certificateSearch, setCertificateSearch] =
    useState("");

  // =====================================
  // CHECK ADMIN / OWNER
  // =====================================

  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsAdmin(false);

      if (!walletAddress || !contract) {
        return;
      }

      try {
        setCheckingAdmin(true);

        const ownerAddress = await contract.owner();

        const connectedAddress =
          walletAddress.toLowerCase();

        const contractOwner =
          ownerAddress.toLowerCase();

        const admin =
          connectedAddress === contractOwner;

        setIsAdmin(admin);

        console.log("=================================");
        console.log("ADMIN ACCESS CHECK");
        console.log("Contract Owner:", ownerAddress);
        console.log("Connected Wallet:", walletAddress);
        console.log("Is Admin:", admin);
        console.log("=================================");

      } catch (error) {
        console.error(
          "Unable to check admin access:",
          error
        );

        setIsAdmin(false);

      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminAccess();
  }, [walletAddress, contract]);

  // =====================================
  // GET WALLET BALANCE
  // =====================================

  useEffect(() => {
    const getWalletBalance = async () => {
      if (!walletAddress || !window.ethereum) {
        setWalletBalance("0.0000");
        return;
      }

      try {
        const provider =
          new ethers.BrowserProvider(
            window.ethereum
          );

        const balance =
          await provider.getBalance(
            walletAddress
          );

        setWalletBalance(
          Number(
            ethers.formatEther(balance)
          ).toFixed(4)
        );

      } catch (error) {
        console.error(
          "Unable to get wallet balance:",
          error
        );

        setWalletBalance("0.0000");
      }
    };

    getWalletBalance();
  }, [walletAddress]);

  // =====================================
  // LOAD ALL CERTIFICATES
  // =====================================

  const loadCertificates = useCallback(async () => {
    if (!contract) {
      setCertificates([]);
      return;
    }

    try {
      setCertificateLoading(true);
      setErrorMessage("");

      // Get total certificate count
      const count =
        await contract.getCertificateCount();

      const total =
        Number(count);

      console.log(
        "Total certificates:",
        total
      );

      const loadedCertificates = [];

      // Get each certificate
      for (let i = 0; i < total; i++) {
        try {
          // Get roll number
          const rollNumber =
            await contract.getCertificateRollNumber(
              i
            );

          // Get certificate details
          const data =
            await contract.getCertificate(
              rollNumber
            );

          loadedCertificates.push({
            studentName: data[0],
            rollNumber: data[1],
            course: data[2],
            certificateHash: data[3],
            ipfsHash: data[4],
            issueDate: data[5],
          });

        } catch (certificateError) {
          console.error(
            `Unable to load certificate ${i}:`,
            certificateError
          );
        }
      }

      setCertificates(
        loadedCertificates
      );

      console.log(
        "Certificates loaded:",
        loadedCertificates
      );

    } catch (error) {
      console.error(
        "Unable to load certificates:",
        error
      );

      setCertificates([]);

      setErrorMessage(
        "Unable to load certificates from the blockchain."
      );

    } finally {
      setCertificateLoading(false);
    }
  }, [contract]);

  // =====================================
  // LOAD CERTIFICATES WHEN CONTRACT READY
  // =====================================

  useEffect(() => {
    if (contract) {
      loadCertificates();
    } else {
      setCertificates([]);
    }
  }, [contract, loadCertificates]);

  // =====================================
  // ISSUE CERTIFICATE
  // =====================================

  const handleIssueCertificate = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setTransactionHash("");

    // -------------------------------
    // WALLET CHECK
    // -------------------------------

    if (!walletAddress || !contract) {
      setErrorMessage(
        "Please connect your MetaMask wallet first."
      );
      return;
    }

    // -------------------------------
    // ADMIN CHECK
    // -------------------------------

    if (!isAdmin) {
      setErrorMessage(
        "Admin access denied. Only the contract owner can issue certificates."
      );
      return;
    }

    // -------------------------------
    // FORM VALIDATION
    // -------------------------------

    if (
      !studentName.trim() ||
      !rollNumber.trim() ||
      !course.trim() ||
      !certificateHash.trim()
    ) {
      setErrorMessage(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setLoading(true);
      setTransactionStatus("preparing");

      console.log(
        "Issuing certificate..."
      );

      // -------------------------------
      // SEND TRANSACTION
      // -------------------------------

      const transaction =
        await contract.issueCertificate(
          studentName.trim(),
          rollNumber.trim(),
          course.trim(),
          certificateHash.trim(),
          ipfsHash.trim()
        );

      setTransactionStatus("submitted");

      setTransactionHash(
        transaction.hash
      );

      console.log(
        "Transaction submitted:",
        transaction.hash
      );

      // -------------------------------
      // WAIT FOR CONFIRMATION
      // -------------------------------

      await transaction.wait();

      setTransactionStatus("confirmed");

      console.log(
        "Transaction confirmed."
      );

      // -------------------------------
      // SUCCESS MESSAGE
      // -------------------------------

      setSuccessMessage(
        "Certificate issued successfully and recorded on the blockchain!"
      );

      // -------------------------------
      // CLEAR FORM
      // -------------------------------

      setStudentName("");
      setRollNumber("");
      setCourse("");
      setCertificateHash("");
      setIpfsHash("");

      // -------------------------------
      // RELOAD CERTIFICATES
      // -------------------------------

      await loadCertificates();

    } catch (error) {
      console.error(
        "Certificate issuing error:",
        error
      );

      setTransactionStatus("error");

      // MetaMask rejection
      if (
        error?.code ===
        "ACTION_REJECTED"
      ) {
        setErrorMessage(
          "Transaction was rejected in MetaMask."
        );

      // Contract revert reason
      } else if (error?.reason) {
        setErrorMessage(
          error.reason
        );

      // Ethers short message
      } else if (error?.shortMessage) {
        setErrorMessage(
          error.shortMessage
        );

      } else {
        setErrorMessage(
          "Transaction failed. Please check MetaMask, your wallet, and the Hardhat Local network."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // RESET STATUS
  // =====================================

  const resetStatus = () => {
    setTransactionStatus("idle");
    setTransactionHash("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  // =====================================
  // SEARCH CERTIFICATES
  // =====================================

  const filteredCertificates =
    certificates.filter(
      (certificate) => {
        const search =
          certificateSearch
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        return (
          certificate.rollNumber
            .toLowerCase()
            .includes(search) ||

          certificate.studentName
            .toLowerCase()
            .includes(search) ||

          certificate.course
            .toLowerCase()
            .includes(search)
        );
      }
    );

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatIssueDate = (
    timestamp
  ) => {
    try {
      if (!timestamp) {
        return "Unknown";
      }

      return new Date(
        Number(timestamp) * 1000
      ).toLocaleString();

    } catch {
      return "Unknown";
    }
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">

      <div className="max-w-7xl mx-auto">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                Administration
              </p>

              <h1 className="text-4xl font-extrabold text-slate-900 mt-1">
                Admin Dashboard
              </h1>

              <p className="text-slate-500 mt-2">
                Issue and manage blockchain-based academic certificates.
              </p>

            </div>

            {/* Blockchain Status */}

            <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm">

              <div className="flex items-center gap-3">

                <span
                  className={`w-3 h-3 rounded-full ${
                    contract
                      ? "bg-green-500"
                      : "bg-slate-400"
                  }`}
                ></span>

                <div>

                  <p className="font-bold text-slate-800">
                    {contract
                      ? "Blockchain Online"
                      : "Wallet Not Connected"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Hardhat Local Network
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================
            ADMIN ACCESS
        ===================================== */}

        {walletAddress && (

          <div
            className={`mb-8 rounded-2xl border p-5 ${
              checkingAdmin
                ? "bg-blue-50 border-blue-200"
                : isAdmin
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  checkingAdmin
                    ? "bg-blue-100"
                    : isAdmin
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {checkingAdmin
                  ? "⏳"
                  : isAdmin
                  ? "👑"
                  : "🚫"}
              </div>

              <div className="flex-1">

                <h2
                  className={`font-bold text-lg ${
                    checkingAdmin
                      ? "text-blue-800"
                      : isAdmin
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {checkingAdmin
                    ? "Checking Admin Access..."
                    : isAdmin
                    ? "Admin Access Granted"
                    : "Admin Access Denied"}
                </h2>

                <p
                  className={`text-sm mt-1 ${
                    checkingAdmin
                      ? "text-blue-700"
                      : isAdmin
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {checkingAdmin
                    ? "Checking your wallet authorization..."
                    : isAdmin
                    ? "You are authorized to issue certificates on this blockchain."
                    : "Only the contract owner can issue certificates."}
                </p>

              </div>

              <div
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  checkingAdmin
                    ? "bg-blue-100 text-blue-700"
                    : isAdmin
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {checkingAdmin
                  ? "CHECKING"
                  : isAdmin
                  ? "AUTHORIZED"
                  : "UNAUTHORIZED"}
              </div>

            </div>

          </div>

        )}


        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Platform */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Platform
                </p>

                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  Blockchain
                </h2>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                ⛓️
              </div>

            </div>

          </div>


          {/* Network */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Network
                </p>

                <h2 className="text-2xl font-bold text-slate-800 mt-1">
                  Hardhat
                </h2>

              </div>

              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
                🌐
              </div>

            </div>

          </div>


          {/* Certificates */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  Certificates
                </p>

                <h2 className="text-2xl font-bold text-blue-600 mt-1">
                  {certificates.length}
                </h2>

              </div>

              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                📜
              </div>

            </div>

          </div>

        </div>


        {/* =====================================
            MAIN CONTENT
        ===================================== */}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* =====================================
              LEFT PANEL
          ===================================== */}

          <div className="lg:col-span-1 space-y-6">

            {/* Issue Information */}

            <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-7">

              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl mb-5">
                📜
              </div>

              <h2 className="text-2xl font-bold">
                Issue Certificate
              </h2>

              <p className="text-slate-300 mt-3 leading-relaxed">
                Create a tamper-resistant academic certificate and securely record its information on the blockchain.
              </p>

              <div className="mt-8 space-y-4">

                <div className="flex gap-3">
                  <span className="text-green-400">
                    ✓
                  </span>

                  <span className="text-slate-300">
                    Blockchain-backed records
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">
                    ✓
                  </span>

                  <span className="text-slate-300">
                    Transparent verification
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">
                    ✓
                  </span>

                  <span className="text-slate-300">
                    Tamper-resistant data
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-400">
                    ✓
                  </span>

                  <span className="text-slate-300">
                    Instant verification
                  </span>
                </div>

              </div>

            </div>


            {/* Wallet Information */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

              <div className="flex items-center justify-between">

                <h3 className="font-bold text-slate-800 text-lg">
                  Wallet Information
                </h3>

                <span className="text-2xl">
                  💳
                </span>

              </div>

              {walletAddress ? (

                <div className="mt-5">

                  <div className="flex items-center gap-2">

                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>

                    <span className="text-green-600 font-semibold">
                      Wallet Connected
                    </span>

                  </div>

                  <div className="mt-4 bg-slate-50 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Wallet Address
                    </p>

                    <p className="font-mono text-xs text-slate-700 break-all mt-2">
                      {walletAddress}
                    </p>

                  </div>

                  <div className="mt-3 bg-blue-50 rounded-xl p-4">

                    <p className="text-xs text-blue-600">
                      Wallet Balance
                    </p>

                    <p className="text-xl font-bold text-blue-700 mt-1">
                      {walletBalance} ETH
                    </p>

                  </div>

                  <div className="mt-4">

                    {checkingAdmin ? (

                      <p className="text-sm text-blue-600">
                        ⏳ Checking administrator privileges...
                      </p>

                    ) : isAdmin ? (

                      <p className="text-sm text-green-600 font-semibold">
                        ✓ Authorized administrator
                      </p>

                    ) : (

                      <p className="text-sm text-red-600 font-semibold">
                        ✕ Unauthorized wallet
                      </p>

                    )}

                  </div>

                </div>

              ) : (

                <div className="mt-5">

                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">

                    <p className="text-sm text-yellow-700">
                      Connect your MetaMask wallet to issue certificates.
                    </p>

                  </div>

                  <button
                    onClick={connect}
                    disabled={connecting}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition"
                  >
                    {connecting
                      ? "Connecting..."
                      : "💳 Connect Wallet"}
                  </button>

                </div>

              )}

            </div>

          </div>


          {/* =====================================
              CERTIFICATE FORM
          ===================================== */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

              <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-7">

                <h2 className="text-2xl font-bold">
                  Certificate Information
                </h2>

                <p className="text-blue-100 mt-1">
                  Enter the certificate details below.
                </p>

              </div>

              <div className="p-7 md:p-8">

                {/* SUCCESS MESSAGE */}

                {successMessage && (

                  <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5">

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                        ✅
                      </div>

                      <div className="flex-1">

                        <h3 className="font-bold text-green-800">
                          Certificate Issued Successfully
                        </h3>

                        <p className="text-sm text-green-700 mt-1">
                          {successMessage}
                        </p>

                        {transactionHash && (

                          <p className="text-xs font-mono text-green-700 break-all mt-3">
                            Transaction:{" "}
                            {transactionHash}
                          </p>

                        )}

                      </div>

                      <button
                        type="button"
                        onClick={resetStatus}
                        className="text-green-600 hover:text-green-800 font-bold"
                      >
                        ✕
                      </button>

                    </div>

                  </div>

                )}


                {/* ERROR MESSAGE */}

                {errorMessage && (

                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-5">

                    <div className="flex items-start gap-3">

                      <div className="text-xl">
                        ❌
                      </div>

                      <div className="flex-1">

                        <h3 className="font-bold text-red-800">
                          Error
                        </h3>

                        <p className="text-sm text-red-700 mt-1">
                          {errorMessage}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setErrorMessage("")
                        }
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>

                    </div>

                  </div>

                )}


                {/* TRANSACTION STATUS */}

                {transactionStatus !== "idle" && (

                  <div className="mb-6 border border-slate-200 rounded-xl p-5">

                    <h3 className="font-bold text-slate-800 mb-4">
                      Transaction Status
                    </h3>

                    <div className="space-y-3">

                      {/* STEP 1 */}

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transactionStatus === "preparing" ||
                            transactionStatus === "submitted" ||
                            transactionStatus === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {transactionStatus ===
                          "preparing"
                            ? "⏳"
                            : "1"}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          Preparing transaction
                        </span>

                      </div>


                      {/* STEP 2 */}

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transactionStatus === "submitted" ||
                            transactionStatus === "confirmed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {transactionStatus ===
                          "submitted"
                            ? "⏳"
                            : transactionStatus ===
                              "confirmed"
                            ? "✓"
                            : "2"}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          Transaction submitted
                        </span>

                      </div>


                      {/* STEP 3 */}

                      <div className="flex items-center gap-3">

                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transactionStatus === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {transactionStatus ===
                          "confirmed"
                            ? "✓"
                            : "3"}
                        </div>

                        <span className="text-sm font-semibold text-slate-700">
                          Blockchain confirmation
                        </span>

                      </div>

                    </div>

                  </div>

                )}


                {/* FORM */}

                <form
                  onSubmit={
                    handleIssueCertificate
                  }
                  className="space-y-6"
                >

                  {/* STUDENT NAME */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Student Name
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) =>
                        setStudentName(
                          e.target.value
                        )
                      }
                      placeholder="Enter student's full name"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>


                  {/* ROLL NUMBER */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Roll Number
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) =>
                        setRollNumber(
                          e.target.value
                        )
                      }
                      placeholder="Example: CS2026006"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>


                  {/* COURSE */}

                  <div>

                    <label className="block font-semibold text-slate-700 mb-2">
                      Course
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      value={course}
                      onChange={(e) =>
                        setCourse(
                          e.target.value
                        )
                      }
                      placeholder="Example: B.Tech CSE"
                      className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />

                  </div>


                  {/* HASHES */}

                  <div className="grid md:grid-cols-2 gap-5">

                    <div>

                      <label className="block font-semibold text-slate-700 mb-2">
                        Certificate Hash
                        <span className="text-red-500 ml-1">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={certificateHash}
                        onChange={(e) =>
                          setCertificateHash(
                            e.target.value
                          )
                        }
                        placeholder="Example: HASH2026006"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />

                    </div>


                    <div>

                      <label className="block font-semibold text-slate-700 mb-2">
                        IPFS Hash
                      </label>

                      <input
                        type="text"
                        value={ipfsHash}
                        onChange={(e) =>
                          setIpfsHash(
                            e.target.value
                          )
                        }
                        placeholder="Optional IPFS hash"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />

                    </div>

                  </div>


                  {/* BLOCKCHAIN INFO */}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

                    <div className="flex gap-3">

                      <span className="text-xl">
                        ℹ️
                      </span>

                      <div>

                        <p className="font-semibold text-blue-800">
                          Blockchain Storage
                        </p>

                        <p className="text-sm text-blue-700 mt-1">
                          Certificate information will be recorded on your connected Hardhat Local blockchain network.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !walletAddress ||
                      checkingAdmin ||
                      !isAdmin
                    }
                    className={`w-full text-white font-bold py-4 rounded-xl transition shadow-sm ${
                      loading ||
                      !walletAddress ||
                      checkingAdmin ||
                      !isAdmin
                        ? "bg-slate-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 hover:shadow-md"
                    }`}
                  >

                    {loading ? (

                      <span className="flex items-center justify-center gap-2">
                        ⏳
                        {transactionStatus ===
                        "submitted"
                          ? "Waiting for Blockchain Confirmation..."
                          : "Processing Transaction..."}
                      </span>

                    ) : !walletAddress ? (

                      "💳 Connect Wallet to Continue"

                    ) : checkingAdmin ? (

                      "⏳ Checking Admin Access..."

                    ) : !isAdmin ? (

                      "🚫 Admin Access Required"

                    ) : (

                      "🔐 Issue Certificate on Blockchain"

                    )}

                  </button>

                </form>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================
            CERTIFICATE MANAGEMENT
        ===================================== */}

        <section className="mt-10">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

            {/* HEADER */}

            <div className="p-6 md:p-7 border-b border-slate-200">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                      📋
                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-slate-900">
                        Certificate Management
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Certificates currently stored on the blockchain.
                      </p>

                    </div>

                  </div>

                </div>


                <button
                  type="button"
                  onClick={loadCertificates}
                  disabled={
                    certificateLoading ||
                    !contract
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold px-5 py-3 rounded-xl transition"
                >
                  {certificateLoading
                    ? "⏳ Loading..."
                    : "🔄 Refresh Certificates"}
                </button>

              </div>


              {/* SEARCH */}

              <div className="mt-6">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Search Certificates
                </label>

                <input
                  type="text"
                  value={certificateSearch}
                  onChange={(e) =>
                    setCertificateSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search by roll number, student name or course..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

              </div>

            </div>


            {/* COUNT */}

            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">

              <div className="flex items-center justify-between">

                <p className="text-sm text-slate-600">

                  Showing{" "}

                  <span className="font-bold text-slate-900">
                    {filteredCertificates.length}
                  </span>{" "}

                  certificate
                  {filteredCertificates.length !== 1
                    ? "s"
                    : ""}

                </p>

                <p className="text-sm text-slate-500">

                  Total:{" "}

                  <span className="font-bold text-slate-700">
                    {certificates.length}
                  </span>

                </p>

              </div>

            </div>


            {/* CONTENT */}

            <div className="p-6">

              {certificateLoading ? (

                <div className="text-center py-12">

                  <div className="text-4xl">
                    ⏳
                  </div>

                  <p className="text-slate-500 mt-3">
                    Loading certificates from blockchain...
                  </p>

                </div>

              ) : certificates.length === 0 ? (

                <div className="text-center py-12">

                  <div className="text-5xl">
                    📭
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mt-4">
                    No Certificates Found
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Issue a certificate to see it appear here.
                  </p>

                </div>

              ) : filteredCertificates.length === 0 ? (

                <div className="text-center py-12">

                  <div className="text-5xl">
                    🔍
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mt-4">
                    No Matching Certificate
                  </h3>

                  <p className="text-slate-500 mt-2">
                    Try another roll number, student name or course.
                  </p>

                </div>

              ) : (

                <div className="grid md:grid-cols-2 gap-6">

                  {filteredCertificates.map(
                    (certificate, index) => (

                      <div
                        key={`${certificate.rollNumber}-${index}`}
                        className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
                      >

                        {/* CARD HEADER */}

                        <div className="bg-slate-900 text-white p-5">

                          <div className="flex items-center justify-between gap-3">

                            <div>

                              <p className="text-xs text-slate-400 uppercase tracking-wider">
                                Certificate
                              </p>

                              <h3 className="text-xl font-bold mt-1">
                                {certificate.studentName}
                              </h3>

                            </div>

                            <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">
                              ✓
                            </div>

                          </div>

                        </div>


                        {/* CARD BODY */}

                        <div className="p-5 space-y-4">

                          {/* ROLL NUMBER */}

                          <div>

                            <p className="text-xs text-slate-500">
                              Roll Number
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {certificate.rollNumber}
                            </p>

                          </div>


                          {/* COURSE */}

                          <div>

                            <p className="text-xs text-slate-500">
                              Course
                            </p>

                            <p className="font-semibold text-slate-800 mt-1">
                              {certificate.course}
                            </p>

                          </div>


                          {/* CERTIFICATE HASH */}

                          <div>

                            <p className="text-xs text-slate-500">
                              Certificate Hash
                            </p>

                            <p className="font-mono text-xs text-slate-700 bg-slate-50 rounded-lg p-3 mt-1 break-all">
                              {certificate.certificateHash}
                            </p>

                          </div>


                          {/* IPFS HASH */}

                          <div>

                            <p className="text-xs text-slate-500">
                              IPFS Hash
                            </p>

                            <p className="font-mono text-xs text-slate-700 bg-slate-50 rounded-lg p-3 mt-1 break-all">
                              {certificate.ipfsHash ||
                                "Not provided"}
                            </p>

                          </div>


                          {/* DATE */}

                          <div className="flex items-center justify-between border-t border-slate-200 pt-4">

                            <div>

                              <p className="text-xs text-slate-500">
                                Issue Date
                              </p>

                              <p className="text-sm font-semibold text-slate-700 mt-1">
                                {formatIssueDate(
                                  certificate.issueDate
                                )}
                              </p>

                            </div>

                            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              VERIFIED RECORD
                            </span>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </section>


        {/* =====================================
            FOOTER
        ===================================== */}

        <div className="text-center py-8">

          <p className="text-sm text-slate-500">
            Blockchain Certificate Verification System
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Certificate records are retrieved directly from the Hardhat Local blockchain.
          </p>

        </div>

      </div>

    </div>
  );
}