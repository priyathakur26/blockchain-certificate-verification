export const CONTRACT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const ABI = [

  // =====================================
  // OWNER
  // =====================================

  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },


  // =====================================
  // CERTIFICATE ISSUED EVENT
  // =====================================

  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "rollNumber",
        type: "string"
      },
      {
        indexed: false,
        internalType: "string",
        name: "studentName",
        type: "string"
      },
      {
        indexed: false,
        internalType: "string",
        name: "course",
        type: "string"
      }
    ],
    name: "CertificateIssued",
    type: "event"
  },


  // =====================================
  // GET CERTIFICATE
  // =====================================

  {
    inputs: [
      {
        internalType: "string",
        name: "_rollNumber",
        type: "string"
      }
    ],
    name: "getCertificate",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "string",
        name: "",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },


  // =====================================
  // ISSUE CERTIFICATE
  // =====================================

  {
    inputs: [
      {
        internalType: "string",
        name: "_studentName",
        type: "string"
      },
      {
        internalType: "string",
        name: "_rollNumber",
        type: "string"
      },
      {
        internalType: "string",
        name: "_course",
        type: "string"
      },
      {
        internalType: "string",
        name: "_certificateHash",
        type: "string"
      },
      {
        internalType: "string",
        name: "_ipfsHash",
        type: "string"
      }
    ],
    name: "issueCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },


  // =====================================
  // VERIFY CERTIFICATE
  // =====================================

  {
    inputs: [
      {
        internalType: "string",
        name: "_rollNumber",
        type: "string"
      },
      {
        internalType: "string",
        name: "_certificateHash",
        type: "string"
      }
    ],
    name: "verifyCertificate",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "view",
    type: "function"
  },


  // =====================================
  // GET CERTIFICATE COUNT
  // =====================================

  {
    inputs: [],
    name: "getCertificateCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },


  // =====================================
  // GET CERTIFICATE ROLL NUMBER
  // =====================================

  {
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256"
      }
    ],
    name: "getCertificateRollNumber",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  }

];