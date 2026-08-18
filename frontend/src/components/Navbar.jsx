import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    walletAddress,
    connecting,
    connect,
  } = useWallet();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const navLinks = [
    {
      path: "/",
      label: "Home",
      icon: "🏠",
    },
    {
      path: "/admin",
      label: "Admin Dashboard",
      icon: "⚙️",
    },
    {
      path: "/verify",
      label: "Verify Certificate",
      icon: "🔍",
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2"
          >
            <span className="text-2xl">
              ⛓️
            </span>

            <span className="font-bold text-lg text-slate-800">
              CertChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  isActive(link.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Desktop Wallet */}
            {walletAddress ? (
              <div className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                <span>
                  {shortenAddress(walletAddress)}
                </span>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                <span>💳</span>

                {connecting
                  ? "Connecting..."
                  : "Connect Wallet"}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${
                  isActive(link.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Mobile Wallet */}
            {walletAddress ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>

                <span>
                  Wallet: {shortenAddress(walletAddress)}
                </span>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                <span>💳</span>

                {connecting
                  ? "Connecting..."
                  : "Connect Wallet"}
              </button>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}