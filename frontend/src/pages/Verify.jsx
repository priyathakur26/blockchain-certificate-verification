

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, ABI } from "../contracts/contract";
import { useWallet } from "../context/WalletContext";

export default function Verify() {
  const {
    walletAddress,
    connecting,
    connect,
  } = useWallet();

  const [searchParams] = useSearchParams();

  // =====================================
  // FORM
  // =====================================

  const [rollNumber, setRollNumber] = useState("");
  const [certificateHash, setCertificateHash] =
    useState("");

  // =====================================
  // CERTIFICATE RESULT
  // =====================================

  const [certificate, setCertificate] =
    useState(null);

  const [verified, setVerified] =
    useState(false);

  // =====================================
  // LOADING / ERROR
  // =====================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================
  // READ-ONLY BLOCKCHAIN PROVIDER
  // =====================================

  const getReadOnlyContract = () => {
    /*
      IMPORTANT:

      Verification uses a read-only JsonRpcProvider.

      Therefore:
      - MetaMask is NOT required
      - User does NOT need to connect wallet
      - QR verification can work directly
      - verifyCertificate() is called as a view function
      - getCertificate() is called as a view function

      This URL works on your local network because
      your laptop is running Hardhat on port 8545.
    */

    const rpcUrl = " http://127.0.0.1:8545/";

    const provider =
      new ethers.JsonRpcProvider(rpcUrl);

    return new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );
  };

  // =====================================
  // VERIFY CERTIFICATE
  // =====================================

  const verifyCertificate = async (
    roll,
    hash
  ) => {
    setError("");
    setCertificate(null);
    setVerified(false);

    if (!roll?.trim() || !hash?.trim()) {
      setError(
        "Please enter both Roll Number and Certificate Hash."
      );
      return;
    }

    try {
      setLoading(true);

      const cleanRollNumber =
        roll.trim();

      const cleanHash =
        hash.trim();

      // =====================================
      // CREATE READ-ONLY CONTRACT
      // =====================================

      const readOnlyContract =
        getReadOnlyContract();

      console.log(
        "Using contract:",
        CONTRACT_ADDRESS
      );

      console.log(
        "Roll Number:",
        cleanRollNumber
      );

      console.log(
        "Certificate Hash:",
        cleanHash
      );

      // =====================================
      // CHECK BLOCKCHAIN CONNECTION
      // =====================================

      try {
        await readOnlyContract.runner.provider
          .getBlockNumber();

        console.log(
          "Connected to Hardhat blockchain"
        );

      } catch (connectionError) {
        console.error(
          "Blockchain connection error:",
          connectionError
        );

        setError(
          "Unable to connect to the Hardhat blockchain. Make sure Hardhat node is running and your laptop IP address is correct."
        );

        return;
      }

      // =====================================
      // CHECK AUTHENTICITY
      // =====================================

      const isValid =
        await readOnlyContract.verifyCertificate(
          cleanRollNumber,
          cleanHash
        );

      console.log(
        "Certificate valid:",
        isValid
      );

      if (!isValid) {
        setError(
          "No matching certificate was found on the blockchain. Please check the Roll Number and Certificate Hash."
        );

        return;
      }

      // =====================================
      // GET CERTIFICATE DETAILS
      // =====================================

      const data =
        await readOnlyContract.getCertificate(
          cleanRollNumber
        );

      console.log(
        "Certificate data:",
        data
      );

      setCertificate({
        studentName: data[0],
        rollNumber: data[1],
        course: data[2],
        certificateHash: data[3],
        ipfsHash: data[4],
        issueDate: data[5],
      });

      setVerified(true);

    } catch (error) {
      console.error(
        "Certificate verification error:",
        error
      );

      if (
        error?.code ===
        "NETWORK_ERROR"
      ) {
        setError(
          "Unable to connect to Hardhat Local. Make sure the Hardhat node is running and your laptop IP address is correct."
        );

      } else if (
        error?.code ===
        "CALL_EXCEPTION"
      ) {
        setError(
          "The certificate could not be read from the blockchain. Please check the contract address and Hardhat network."
        );

      } else if (error?.reason) {
        setError(error.reason);

      } else if (error?.shortMessage) {
        setError(error.shortMessage);

      } else {
        setError(
          "Unable to verify certificate. Please check that Hardhat Local is running and the correct contract is connected."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // MANUAL VERIFY
  // =====================================

  const handleVerify = async (e) => {
    e.preventDefault();

    await verifyCertificate(
      rollNumber,
      certificateHash
    );
  };

  // =====================================
  // LOAD QR PARAMETERS
  // =====================================

  useEffect(() => {
    const urlRollNumber =
      searchParams.get("rollNumber");

    const urlCertificateHash =
      searchParams.get("certificateHash");

    if (
      urlRollNumber &&
      urlCertificateHash
    ) {
      setRollNumber(urlRollNumber);
      setCertificateHash(urlCertificateHash);

      verifyCertificate(
        urlRollNumber,
        urlCertificateHash
      );
    }
  }, [searchParams]);

  // =====================================
  // AUTO VERIFY QR
  // =====================================

  useEffect(() => {
    const urlRollNumber =
      searchParams.get("rollNumber");

    const urlCertificateHash =
      searchParams.get("certificateHash");

    if (
      urlRollNumber &&
      urlCertificateHash
    ) {
      verifyCertificate(
        urlRollNumber,
        urlCertificateHash
      );
    }
  }, [searchParams]);

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "N/A";
    }

    return new Date(
      Number(timestamp) * 1000
    ).toLocaleString();
  };

  // =====================================
  // VERIFICATION URL
  // =====================================

  const getVerificationURL = () => {
    if (!certificate) {
      return "";
    }

    /*
      IMPORTANT:

      Use the laptop's LAN IP instead of
      localhost so the QR code can be opened
      from another device on the same Wi-Fi.
    */

    const baseURL =
      `${window.location.protocol}//` +
      `${window.location.hostname}:5173`;

    return (
      `${baseURL}/verify` +
      `?rollNumber=${encodeURIComponent(
        certificate.rollNumber
      )}` +
      `&certificateHash=${encodeURIComponent(
        certificate.certificateHash
      )}`
    );
  };

  // =====================================
  // DOWNLOAD PDF
  // =====================================

  const downloadCertificate = async () => {
    if (!certificate) {
      return;
    }

    try {
      const doc = new jsPDF();

      const qrCode =
        await QRCode.toDataURL(
          getVerificationURL(),
          {
            width: 300,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );

      // BORDER

      doc.setDrawColor(
        30,
        64,
        175
      );

      doc.setLineWidth(1.5);

      doc.rect(
        10,
        10,
        190,
        277
      );

      // HEADER

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(24);

      doc.text(
        "DIGITAL CERTIFICATE",
        105,
        30,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(11);

      doc.text(
        "Blockchain Certificate Verification System",
        105,
        39,
        {
          align: "center",
        }
      );

      // DIVIDER

      doc.line(
        25,
        48,
        185,
        48
      );

      // VERIFIED STATUS

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(18);

      doc.text(
        "✓ BLOCKCHAIN VERIFIED",
        105,
        63,
        {
          align: "center",
        }
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(10);

      doc.text(
        "This certificate matches the record stored on the blockchain.",
        105,
        72,
        {
          align: "center",
        }
      );

      // CERTIFICATE INFORMATION

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(14);

      doc.text(
        "Certificate Information",
        25,
        90
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(11);

      doc.text(
        `Student Name: ${certificate.studentName}`,
        25,
        104
      );

      doc.text(
        `Roll Number: ${certificate.rollNumber}`,
        25,
        117
      );

      doc.text(
        `Course: ${certificate.course}`,
        25,
        130
      );

      doc.text(
        `Issue Date: ${formatDate(
          certificate.issueDate
        )}`,
        25,
        143
      );

      // HASH

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "Certificate Hash:",
        25,
        160
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        certificate.certificateHash,
        25,
        169
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        "IPFS Hash:",
        25,
        183
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.text(
        certificate.ipfsHash ||
          "N/A",
        25,
        192
      );

      // QR CODE

      if (qrCode) {
        doc.addImage(
          qrCode,
          "PNG",
          75,
          205,
          60,
          60
        );
      }

      doc.setFontSize(10);

      doc.text(
        "Scan the QR code to verify this certificate.",
        105,
        273,
        {
          align: "center",
        }
      );

      doc.save(
        `Certificate-${certificate.rollNumber}.pdf`
      );

    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      setError(
        "Unable to generate the certificate PDF."
      );
    }
  };

  // =====================================
  // PRINT
  // =====================================

  const printCertificate = () => {
    window.print();
  };

  // =====================================
  // CLEAR RESULT
  // =====================================

  const clearResult = () => {
    setCertificate(null);
    setVerified(false);
    setError("");
    setRollNumber("");
    setCertificateHash("");
  };

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">

      {/* HEADER */}

      <div className="max-w-6xl mx-auto text-center mb-10">

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white text-4xl shadow-xl">
          🎓
        </div>

        <h1 className="mt-5 text-4xl md:text-5xl font-extrabold text-slate-900">
          Certificate Verification
        </h1>

        <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
          Verify the authenticity of an academic
          certificate using secure blockchain
          technology.
        </p>

      </div>

      <div className="max-w-6xl mx-auto">

        {/* =====================================
            VERIFICATION FORM
        ===================================== */}

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold">
                  Blockchain Authentication
                </p>

                <h2 className="text-3xl font-bold mt-1">
                  Verify Certificate
                </h2>

                <p className="text-blue-100 mt-2">
                  Enter the certificate details to
                  verify its authenticity.
                </p>

              </div>

              {/* WALLET IS OPTIONAL FOR VERIFICATION */}

              {walletAddress ? (

                <div className="flex items-center gap-3 bg-white/10 border border-white/20 px-5 py-3 rounded-xl">

                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>

                  <div>

                    <p className="text-sm font-semibold">
                      Wallet Connected
                    </p>

                    <p className="text-xs text-blue-100 font-mono">
                      {walletAddress.slice(0, 6)}
                      ...
                      {walletAddress.slice(-4)}
                    </p>

                  </div>

                </div>

              ) : (

                <div className="bg-white/10 border border-white/20 px-5 py-3 rounded-xl">

                  <p className="text-sm font-semibold">
                    🔎 Read-Only Verification
                  </p>

                  <p className="text-xs text-blue-100 mt-1">
                    Wallet not required
                  </p>

                </div>

              )}

            </div>

          </div>

          <div className="p-8">

            {/* QR NOTICE */}

            {searchParams.get("rollNumber") &&
              searchParams.get(
                "certificateHash"
              ) && (

                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">

                  <div className="flex items-start gap-3">

                    <div className="text-2xl">
                      📱
                    </div>

                    <div>

                      <h3 className="font-bold text-blue-800">
                        QR Verification Request
                      </h3>

                      <p className="text-sm text-blue-700 mt-1">
                        Certificate details were
                        loaded from the QR code.
                        Verification is being
                        performed automatically.
                      </p>

                    </div>

                  </div>

                </div>
              )}

            <form
              onSubmit={handleVerify}
              className="grid md:grid-cols-2 gap-6"
            >

              {/* ROLL NUMBER */}

              <div>

                <label className="block font-semibold text-slate-700 mb-2">
                  Roll Number
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
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

              </div>

              {/* CERTIFICATE HASH */}

              <div>

                <label className="block font-semibold text-slate-700 mb-2">
                  Certificate Hash
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
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />

              </div>

              {/* BUTTON */}

              <div className="md:col-span-2">

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold text-lg transition shadow-lg"
                >

                  {loading
                    ? "🔄 Checking Blockchain..."
                    : "🔍 Verify Certificate"}

                </button>

              </div>

            </form>

            {/* ERROR */}

            {error && (

              <div className="mt-7 bg-red-50 border border-red-200 rounded-2xl p-6">

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
                    ❌
                  </div>

                  <div>

                    <h3 className="font-bold text-red-800 text-lg">
                      Verification Failed
                    </h3>

                    <p className="text-red-700 mt-1">
                      {error}
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* =====================================
            VERIFIED CERTIFICATE
        ===================================== */}

        {verified &&
          certificate && (

            <div className="mt-10 bg-white rounded-3xl shadow-2xl border border-green-200 overflow-hidden print:shadow-none">

              {/* VERIFIED HEADER */}

              <div className="bg-linear-to-r from-green-600 to-emerald-600 text-white p-8 text-center">

                <div className="mx-auto w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-5xl">
                  ✓
                </div>

                <h2 className="mt-5 text-3xl md:text-4xl font-extrabold">
                  Certificate Verified
                </h2>

                <p className="mt-2 text-green-100">
                  Authentic certificate record found
                  on blockchain
                </p>

                <div className="mt-5 inline-flex items-center gap-2 bg-white text-green-700 px-5 py-2 rounded-full font-bold">
                  🛡️ BLOCKCHAIN VERIFIED
                </div>

              </div>

              {/* BODY */}

              <div className="p-8 md:p-10">

                <div className="text-center mb-10">

                  <p className="uppercase tracking-[0.3em] text-sm text-slate-400 font-semibold">
                    Official Digital Certificate
                  </p>

                  <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mt-2">
                    Certificate of Achievement
                  </h2>

                  <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full"></div>

                </div>

                {/* STUDENT */}

                <div className="text-center mb-10">

                  <p className="text-sm text-slate-500">
                    This certificate is issued to
                  </p>

                  <h3 className="text-3xl md:text-4xl font-extrabold text-blue-700 mt-2">
                    {certificate.studentName}
                  </h3>

                  <p className="text-slate-500 mt-2">
                    for successfully completing
                  </p>

                  <h4 className="text-xl font-bold text-slate-800 mt-2">
                    {certificate.course}
                  </h4>

                </div>

                {/* BASIC INFORMATION */}

                <div className="grid md:grid-cols-2 gap-5">

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">

                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Roll Number
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                      {certificate.rollNumber}
                    </p>

                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">

                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Issue Date
                    </p>

                    <p className="mt-2 text-lg font-bold text-slate-800">
                      {formatDate(
                        certificate.issueDate
                      )}
                    </p>

                  </div>

                </div>

                {/* HASHES */}

                <div className="mt-6 space-y-4">

                  <div className="border border-slate-200 rounded-2xl p-5">

                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Certificate Hash
                    </p>

                    <p className="mt-2 font-mono text-sm text-slate-800 break-all">
                      {certificate.certificateHash}
                    </p>

                  </div>

                  <div className="border border-slate-200 rounded-2xl p-5">

                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      IPFS Hash
                    </p>

                    <p className="mt-2 font-mono text-sm text-slate-800 break-all">
                      {certificate.ipfsHash ||
                        "Not provided"}
                    </p>

                  </div>

                </div>

                {/* QR */}

                <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-7 text-center">

                  <div className="flex items-center justify-center gap-2">

                    <span className="text-2xl">
                      📱
                    </span>

                    <h3 className="text-xl font-bold text-slate-800">
                      Quick Verification
                    </h3>

                  </div>

                  <p className="text-sm text-slate-500 mt-2">
                    Scan this QR code to automatically
                    verify this certificate.
                  </p>

                  <div className="mt-6 flex justify-center">

                    <div className="bg-white p-4 rounded-2xl shadow-md">

                      <QRCodeCanvas
                        value={getVerificationURL()}
                        size={220}
                        bgColor="#ffffff"
                        fgColor="#000000"
                        level="H"
                      />

                    </div>

                  </div>

                  <p className="text-xs text-slate-400 mt-4 break-all">
                    {getVerificationURL()}
                  </p>

                </div>

                {/* BLOCKCHAIN */}

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-7">

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                      ⛓️
                    </div>

                    <div className="flex-1">

                      <h3 className="text-xl font-bold text-blue-800">
                        Blockchain Record
                      </h3>

                      <p className="text-sm text-blue-700 mt-1">
                        The certificate information was
                        successfully matched with the
                        blockchain record.
                      </p>

                      <div className="mt-5 grid md:grid-cols-2 gap-4">

                        <div className="bg-white rounded-xl p-4">

                          <p className="text-xs text-slate-400 uppercase tracking-wider">
                            Network
                          </p>

                          <p className="font-bold text-slate-800 mt-1">
                            Hardhat Local
                          </p>

                        </div>

                        <div className="bg-white rounded-xl p-4">

                          <p className="text-xs text-slate-400 uppercase tracking-wider">
                            Verification
                          </p>

                          <p className="font-bold text-green-600 mt-1">
                            ✓ Authentic
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-8 grid md:grid-cols-3 gap-4">

                  <button
                    onClick={printCertificate}
                    className="bg-slate-800 hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold transition"
                  >
                    🖨️ Print Certificate
                  </button>

                  <button
                    onClick={
                      downloadCertificate
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition"
                  >
                    📄 Download PDF
                  </button>

                  <button
                    onClick={clearResult}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-xl font-bold transition border border-slate-200"
                  >
                    🔄 Verify Another
                  </button>

                </div>

              </div>

            </div>
          )}

      </div>

    </div>
  );
}
