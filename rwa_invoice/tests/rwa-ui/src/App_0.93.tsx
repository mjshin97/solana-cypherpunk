import React, { useState } from "react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import * as splToken from "@solana/spl-token";
import "@solana/wallet-adapter-react-ui/styles.css";

interface InvoiceData {
  busId: string;
  date: string;
  passengers: number;
  revenueSOL: number;
  gasoline: number;
  taxes: number;
  busRent: number;
  maintenance: number;
}

const App: React.FC = () => {
  const { publicKey, connected, signTransaction } = useWallet();

  const [busId, setBusId] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(0);
  const [revenueSOL, setRevenueSOL] = useState(0);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const handleGenerateInvoice = async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert("Wallet not connected!");
      return;
    }

    const newInvoice: InvoiceData = {
      busId,
      date,
      passengers,
      revenueSOL,
      gasoline: revenueSOL * 0.3,
      taxes: revenueSOL * 0.1,
      busRent: revenueSOL * 0.25,
      maintenance: revenueSOL * 0.15,
    };

    console.log("Connected wallet:", publicKey.toBase58());
    console.log("Generated Invoice:", newInvoice);

    setInvoice(newInvoice);
    setStatus("⏳ Minting NFT invoice...");

    try {
      const connection = new Connection(clusterApiUrl("devnet"));

      const mint = Keypair.generate();
      const tokenATA = await splToken.getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      const lamports = await splToken.getMinimumBalanceForRentExemptMint(
        connection
      );

      const transaction = new Transaction();

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: splToken.MINT_SIZE,
          lamports,
          programId: splToken.TOKEN_PROGRAM_ID,
        })
      );

      transaction.add(
        splToken.createInitializeMintInstruction(
          mint.publicKey,
          0,
          publicKey,
          publicKey
        )
      );

      transaction.add(
        splToken.createAssociatedTokenAccountInstruction(
          publicKey,
          tokenATA,
          publicKey,
          mint.publicKey
        )
      );

      transaction.add(
        splToken.createMintToInstruction(
          mint.publicKey,
          tokenATA,
          publicKey,
          1
        )
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash())
        .blockhash;

      const signedTx = await signTransaction(transaction);
      signedTx.partialSign(mint);

      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      console.log("NFT Mint Signature:", signature);
      setTxSig(signature);
      setStatus("✅ NFT minted successfully!");
    } catch (err) {
      console.error("❌ Error minting NFT:", err);
      setStatus("❌ Failed to mint NFT invoice");
    }
  };

  const handleCreateNewInvoice = () => {
    setBusId("");
    setDate("");
    setPassengers(0);
    setRevenueSOL(0);
    setInvoice(null);
    setTxSig(null);
    setStatus("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg transition-all duration-300">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
          🚍 RWA NFT Invoice Generator
        </h1>
        <p className="text-gray-500 text-center mb-6">
          Generate blockchain-verified transport invoices
        </p>

        <div className="flex justify-center mb-6">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-xl" />
        </div>

        {!invoice && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Bus ID</label>
              <input
                type="text"
                placeholder="ex: BUS-101"
                value={busId}
                onChange={(e) => setBusId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Passenger Count</label>
              <input
                type="number"
                placeholder="ex: 10"
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Revenue (in SOL)</label>
              <input
                type="number"
                placeholder="ex: 100"
                value={revenueSOL}
                onChange={(e) => setRevenueSOL(Number(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleGenerateInvoice}
              className="mt-4 w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Generate & Mint NFT
            </button>
          </div>
        )}

        {status && (
          <div className="mt-6 text-center text-gray-700 font-medium">
            {status}
          </div>
        )}

        {invoice && (
          <div className="mt-6 bg-gray-50 rounded-xl shadow-inner p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
              Invoice Summary
            </h2>
            <table className="w-full border border-gray-200 text-sm text-gray-700">
              <tbody>
                {Object.entries(invoice).map(([key, value]) => (
                  <tr
                    key={key}
                    className="even:bg-gray-100 border-b border-gray-200"
                  >
                    <td className="capitalize py-2 px-3 font-medium w-1/3">{key}</td>
                    <td className="py-2 px-3 text-right">
                      {typeof value === "number" ? value.toFixed(2) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {txSig && (
              <div className="mt-4 text-center flex flex-col items-center gap-3">
                <a
                  href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View on Solana Explorer
                </a>
                <div className="mt-2">
                  <button
                    onClick={handleCreateNewInvoice}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Create New Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-gray-500 mt-8 text-sm">
        © 2025 RWA Invoice System — powered by Solana
      </footer>
    </div>
  );
};

export default function AppWithProvider() {
  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
