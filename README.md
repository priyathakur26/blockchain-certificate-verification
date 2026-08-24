# 🔐 CertChain — Blockchain Certificate Verification System

A decentralized certificate verification platform that uses **Ethereum Blockchain, Solidity, React, and QR Codes** to issue and verify academic certificates securely.

Certificates issued by an authorized administrator are stored on the **Ethereum Sepolia test network** and can be verified publicly through a QR code without requiring the user to connect a crypto wallet.

---

## 🌐 Live Demo

🔗 **Live Website:**  
https://blockchain-certificate-verification-m50xd8iv5-techvortex1.vercel.app/

🔗 **GitHub Repository:**  
https://github.com/priyathakur26/blockchain-certificate-verification.git

---

## 📌 Project Overview

Traditional certificate verification systems often depend on centralized databases and manual verification.

CertChain provides a blockchain-based solution where certificate records are stored on Ethereum and can be independently verified using a unique certificate hash and QR code.

The system provides two main roles:

### 👨‍💼 Administrator

- Connect MetaMask wallet
- Issue certificates
- Store certificate information on Ethereum Sepolia
- Generate QR-based verification links

### 👨‍🎓 Certificate User / Verifier

- Open the verification website
- Scan the certificate QR code
- Automatically load certificate information
- Verify certificate authenticity directly from blockchain
- No MetaMask wallet required

---

## ✨ Features

### 🔗 Blockchain-Based Storage

Certificate records are stored on the Ethereum Sepolia blockchain using a Solidity smart contract.

### 🔐 Tamper-Resistant Verification

Certificate information is verified against the blockchain record, making unauthorized modification detectable.

### 📱 QR Code Verification

Each certificate contains a QR code that opens the verification page automatically.

### 🌐 Public Verification

Anyone can verify a certificate without installing MetaMask or connecting a wallet.

### 💳 Wallet Integration

MetaMask is used by administrators for blockchain transactions when issuing certificates.

### 📄 Digital Certificate Generation

Verified certificates can be printed or downloaded as PDF documents.

### 📦 IPFS Support

The system stores an IPFS hash associated with certificate records for decentralized document referencing.

### 📱 Responsive Interface

The application works on desktop and mobile devices.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │     Administrator    │
                    │                      │
                    │     MetaMask Wallet  │
                    └──────────┬───────────┘
                               │
                               │ Issue Certificate
                               ▼
                    ┌──────────────────────┐
                    │  React Frontend      │
                    │  Admin Dashboard     │
                    └──────────┬───────────┘
                               │
                               │ Blockchain Transaction
                               ▼
                    ┌──────────────────────┐
                    │ Solidity Smart       │
                    │ Contract             │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Ethereum Sepolia     │
                    │ Blockchain            │
                    └──────────┬───────────┘
                               │
                               │ Read Certificate
                               ▼
                    ┌──────────────────────┐
                    │ Public Verification  │
                    │ Page                 │
                    └──────────┬───────────┘
                               │
                               ▼
                         📱 QR Code
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Student / Verifier   │
                    │                      │
                    │ No Wallet Required   │
                    └──────────────────────┘
