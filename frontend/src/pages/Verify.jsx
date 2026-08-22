

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { useSearchParams } from "react-router-dom";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  ABI,
} from "../contracts/contract";

export default function Verify() {

  const [searchParams] = useSearchParams();

  // =====================================
  // FORM
  // =====================================

  const [rollNumber, setRollNumber] =
    useState("");

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
  // SEPOLIA RPC
  // =====================================

  /*
   * IMPORTANT
   *
   * This provider is completely independent
   * of MetaMask.
   *
   * Therefore QR verification can work on:
   *
   * - Android
   * - iPhone
   * - Laptop
   * - Desktop
   *
   * without installing MetaMask.
   */

  const SEPOLIA_RPC =
    "https://ethereum-sepolia-rpc.publicnode.com";

  // =====================================
  // CREATE PUBLIC READ-ONLY CONTRACT
  // =====================================

  const getReadOnlyContract = () => {

    const provider =
      new ethers.JsonRpcProvider(
        SEPOLIA_RPC,
        {
          name: "sepolia",
          chainId: 11155111,
        },
        {
          staticNetwork: true,
        }
      );

    const contract =
      new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        provider
      );

    return {
      provider,
      contract,
    };
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

    if (
      !roll?.trim() ||
      !hash?.trim()
    ) {

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

      console.log(
        "================================="
      );

      console.log(
        "PUBLIC SEPOLIA VERIFICATION"
      );

      console.log(
        "================================="
      );

      console.log(
        "RPC:",
        SEPOLIA_RPC
      );

      console.log(
        "Contract:",
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
      // CREATE PROVIDER + CONTRACT
      // =====================================

      const {
        provider,
        contract,
      } =
        getReadOnlyContract();


      // =====================================
      // CHECK NETWORK
      // =====================================

      const network =
        await provider.getNetwork();

      console.log(
        "Read-only network:",
        network.chainId.toString()
      );

      if (
        network.chainId.toString() !==
        "11155111"
      ) {

        setError(
          "The verification service is not connected to Ethereum Sepolia."
        );

        return;
      }

      console.log(
        "Connected successfully to Ethereum Sepolia"
      );


      // =====================================
      // CHECK CONTRACT
      // =====================================

      const code =
        await provider.getCode(
          CONTRACT_ADDRESS
        );

      console.log(
        "Contract bytecode exists:",
        code !== "0x"
      );

      if (
        code === "0x"
      ) {

        setError(
          "No contract was found at the configured Sepolia contract address."
        );

        return;
      }


      // =====================================
      // VERIFY CERTIFICATE
      // =====================================

      console.log(
        "Checking certificate authenticity..."
      );

      const isValid =
        await contract.verifyCertificate(
          cleanRollNumber,
          cleanHash
        );

      console.log(
        "Certificate valid:",
        isValid
      );


      if (!isValid) {

        setError(
          "No matching certificate was found on the Sepolia blockchain. Please check the Roll Number and Certificate Hash."
        );

        return;
      }


      // =====================================
      // GET CERTIFICATE DETAILS
      // =====================================

      console.log(
        "Certificate verified."
      );

      console.log(
        "Reading certificate details..."
      );

      const data =
        await contract.getCertificate(
          cleanRollNumber
        );

      console.log(
        "Certificate data:",
        data
      );


      // =====================================
      // SAVE CERTIFICATE
      // =====================================

      setCertificate({

        studentName:
          data[0],

        rollNumber:
          data[1],

        course:
          data[2],

        certificateHash:
          data[3],

        ipfsHash:
          data[4],

        issueDate:
          data[5],

      });

      setVerified(true);

      console.log(
        "================================="
      );

      console.log(
        "CERTIFICATE VERIFIED SUCCESSFULLY"
      );

      console.log(
        "================================="
      );


    } catch (error) {

      console.error(
        "Certificate verification error:",
        error
      );

      console.error(
        "Error code:",
        error?.code
      );

      console.error(
        "Short message:",
        error?.shortMessage
      );

      console.error(
        "Reason:",
        error?.reason
      );


      if (
        error?.code ===
        "CALL_EXCEPTION"
      ) {

        setError(
          "The Sepolia contract could not be read. Please check the contract address and certificate details."
        );

      } else if (
        error?.code ===
        "BAD_DATA"
      ) {

        setError(
          "The blockchain returned invalid data. Please check that the deployed contract ABI matches this application."
        );

      } else if (
        error?.code ===
        "NETWORK_ERROR"
      ) {

        setError(
          "Unable to connect to the Sepolia network. Please check your internet connection."
        );

      } else if (
        error?.reason
      ) {

        setError(
          error.reason
        );

      } else if (
        error?.shortMessage
      ) {

        setError(
          error.shortMessage
        );

      } else {

        setError(
          "Unable to verify the certificate. Please try again."
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
      searchParams.get(
        "rollNumber"
      );

    const urlCertificateHash =
      searchParams.get(
        "certificateHash"
      );


    if (
      urlRollNumber &&
      urlCertificateHash
    ) {

      const decodedRoll =
        urlRollNumber.trim();

      const decodedHash =
        urlCertificateHash.trim();

      setRollNumber(
        decodedRoll
      );

      setCertificateHash(
        decodedHash
      );


      /*
       * Automatically verify.
       *
       * NO WALLET.
       * NO METAMASK.
       * NO WALLET CONTEXT.
       */

      verifyCertificate(
        decodedRoll,
        decodedHash
      );

    }

  }, [searchParams]);


  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (
    timestamp
  ) => {

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
     * IMPORTANT:
     *
     * This remains your laptop's LAN address.
     *
     * Example:
     *
     * http://192.168.1.5:5173/verify
     *
     * The phone only needs to be on the
     * same Wi-Fi network to open the website.
     *
     * Blockchain verification itself uses
     * PUBLIC SEPOLIA RPC.
     */

    const baseURL =
      `${window.location.protocol}//${window.location.host}`;

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

      const doc =
        new jsPDF();

      const qrCode =
        await QRCode.toDataURL(
          getVerificationURL(),
          {
            width: 300,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );


      // =====================================
      // BORDER
      // =====================================

      doc.setDrawColor(
        30,
        64,
        175
      );

      doc.setLineWidth(
        1.5
      );

      doc.rect(
        10,
        10,
        190,
        277
      );


      // =====================================
      // HEADER
      // =====================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        24
      );

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

      doc.setFontSize(
        11
      );

      doc.text(
        "Blockchain Certificate Verification System",
        105,
        39,
        {
          align: "center",
        }
      );


      // =====================================
      // DIVIDER
      // =====================================

      doc.line(
        25,
        48,
        185,
        48
      );


      // =====================================
      // VERIFIED STATUS
      // =====================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        18
      );

      doc.text(
        "BLOCKCHAIN VERIFIED",
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

      doc.setFontSize(
        10
      );

      doc.text(
        "This certificate matches the record stored on the blockchain.",
        105,
        72,
        {
          align: "center",
        }
      );


      // =====================================
      // CERTIFICATE INFORMATION
      // =====================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(
        14
      );

      doc.text(
        "Certificate Information",
        25,
        90
      );


      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(
        11
      );

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


      // =====================================
      // HASH
      // =====================================

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


      // =====================================
      // QR CODE
      // =====================================

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


      doc.setFontSize(
        10
      );

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

            <div>

              <p className="text-blue-100 text-sm uppercase tracking-wider font-semibold">
                Blockchain Authentication
              </p>

              <h2 className="text-3xl font-bold mt-1">
                Verify Certificate
              </h2>

              <p className="text-blue-100 mt-2">
                No wallet is required for certificate verification.
              </p>

            </div>

          </div>


          <div className="p-8">

            {/* QR NOTICE */}

            {searchParams.get(
              "rollNumber"
            ) &&
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
                        Certificate details were loaded
                        from the QR code. Verification is
                        being performed automatically.
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
                            Ethereum Sepolia
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