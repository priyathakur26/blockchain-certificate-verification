export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-24">

        {/* Decorative Background */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 text-blue-300 px-5 py-2 rounded-full text-sm font-semibold mb-7">
            🔐 Blockchain Powered
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Secure Your
            <span className="text-blue-400"> Academic Certificates</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300 leading-relaxed">
            Issue, store and verify academic certificates securely
            using blockchain technology. Fast, transparent and
            tamper-resistant.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">

            <a
              href="/verify"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              🔍 Verify Certificate
            </a>

            <a
              href="/admin"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl transition"
            >
              ⚙️ Admin Dashboard
            </a>

          </div>

          {/* Trust Text */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-400">

            <span>✓ Blockchain Secured</span>
            <span>✓ Instant Verification</span>
            <span>✓ QR Enabled</span>

          </div>

        </div>
      </section>


      {/* ================= STATS ================= */}
      <section className="px-6 -mt-8 relative z-10">

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              🔗
            </div>
            <h3 className="mt-2 font-bold text-slate-800">
              Blockchain
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Secure storage
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              ✓
            </div>
            <h3 className="mt-2 font-bold text-slate-800">
              Verified
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Authentic records
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 text-center">
            <div className="text-3xl">
              📱
            </div>
            <h3 className="mt-2 font-bold text-slate-800">
              QR Code
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Easy verification
            </p>
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="px-6 py-24">

        <div className="max-w-6xl mx-auto">

          <div className="text-center">

            <p className="text-blue-600 font-semibold">
              POWERFUL FEATURES
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-800">
              Why Use Blockchain Verification?
            </h2>

            <p className="mt-4 max-w-2xl mx-auto text-slate-500">
              A modern approach to issuing and verifying academic
              credentials securely.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-7 mt-12">

            {/* Card 1 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition">

              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-100 text-3xl group-hover:scale-110 transition">
                🔒
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-800">
                Tamper Resistant
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Certificate records are stored on blockchain,
                making unauthorized modification extremely difficult.
              </p>

            </div>


            {/* Card 2 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition">

              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-green-100 text-3xl group-hover:scale-110 transition">
                ⚡
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-800">
                Instant Verification
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Verify certificate authenticity in seconds using
                blockchain records.
              </p>

            </div>


            {/* Card 3 */}
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition">

              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-purple-100 text-3xl group-hover:scale-110 transition">
                🌐
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-800">
                Decentralized
              </h3>

              <p className="mt-3 text-slate-600 leading-relaxed">
                Verification relies on blockchain records instead
                of a traditional centralized database.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white px-6 py-24">

        <div className="max-w-5xl mx-auto">

          <div className="text-center">

            <p className="text-blue-600 font-semibold">
              SIMPLE PROCESS
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-slate-800">
              How It Works
            </h2>

          </div>


          <div className="grid md:grid-cols-3 gap-8 mt-14">

            {/* Step 1 */}
            <div className="text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                01
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-800">
                Issue
              </h3>

              <p className="mt-3 text-slate-600">
                An authorized administrator enters certificate
                information and records it on the blockchain.
              </p>

            </div>


            {/* Step 2 */}
            <div className="text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                02
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-800">
                Store
              </h3>

              <p className="mt-3 text-slate-600">
                The certificate record is securely stored through
                the blockchain smart contract.
              </p>

            </div>


            {/* Step 3 */}
            <div className="text-center">

              <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                03
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-800">
                Verify
              </h3>

              <p className="mt-3 text-slate-600">
                Anyone can verify the certificate using its roll
                number and certificate hash.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="px-6 py-20">

        <div className="max-w-5xl mx-auto rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 p-10 md:p-14 text-center shadow-xl">

          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Verify a Certificate?
          </h2>

          <p className="mt-4 text-blue-100 max-w-2xl mx-auto">
            Check the authenticity of an academic certificate
            using our blockchain-powered verification system.
          </p>

          <a
            href="/verify"
            className="inline-block mt-8 bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl transition"
          >
            🔍 Verify Certificate
          </a>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-950 text-white px-6 py-10">

        <div className="max-w-6xl mx-auto text-center">

          <div className="text-2xl font-bold">
            🔐 Blockchain Certificate Verification
          </div>

          <p className="mt-3 text-slate-400">
            Secure • Transparent • Verifiable
          </p>

          <div className="mt-6 border-t border-slate-800 pt-6">

            <p className="text-sm text-slate-500">
              Built with React, Solidity, Ethers.js & Hardhat
            </p>

            <p className="text-xs text-slate-600 mt-2">
              Blockchain Certificate Verification System
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}