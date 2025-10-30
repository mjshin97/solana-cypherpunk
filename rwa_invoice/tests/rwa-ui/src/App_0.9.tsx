import React, { useState } from "react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  PublicKey,
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

// NFT invoice 데이터 타입
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

  const handleGenerateInvoice = async () => {
    if (!connected || !publicKey) {
      alert("Wallet not connected!");
      return;
    }

    // 간단한 예시 공식
    const gasoline = revenueSOL * 0.3;
    const taxes = revenueSOL * 0.1;
    const busRent = revenueSOL * 0.25;
    const maintenance = revenueSOL * 0.15;

    const newInvoice: InvoiceData = {
      busId,
      date,
      passengers,
      revenueSOL,
      gasoline,
      taxes,
      busRent,
      maintenance,
    };

    try {
      const connection = new Connection(clusterApiUrl("devnet"));
      console.log("Connected wallet:", publicKey.toBase58());
      console.log("Generated Invoice:", newInvoice);

      // === NFT MINT LOGIC ===
      const mint = Keypair.generate();
      const tokenATA = await splToken.getAssociatedTokenAddress(
        mint.publicKey,
        publicKey
      );

      const lamports = await splToken.getMinimumBalanceForRentExemptMint(
        connection
      );

      const transaction = new Transaction();

      // 1️⃣ Create new mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mint.publicKey,
          space: splToken.MINT_SIZE,
          lamports,
          programId: splToken.TOKEN_PROGRAM_ID,
        })
      );

      // 2️⃣ Initialize mint
      transaction.add(
        splToken.createInitializeMintInstruction(
          mint.publicKey,
          0,
          publicKey,
          publicKey
        )
      );

      // 3️⃣ Create ATA (token account)
      transaction.add(
        splToken.createAssociatedTokenAccountInstruction(
          publicKey,
          tokenATA,
          publicKey,
          mint.publicKey
        )
      );

      // 4️⃣ Mint one NFT to wallet
      transaction.add(
        splToken.createMintToInstruction(
          mint.publicKey,
          tokenATA,
          publicKey,
          1
        )
      );

      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      // Sign transaction with Phantom
      const signedTx = await signTransaction!(transaction);
      signedTx.partialSign(mint);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      console.log("NFT Mint Signature:", signature);
      setTxSig(signature);
      setInvoice(newInvoice);
    } catch (err) {
      console.error("❌ Error minting NFT:", err);
      alert("Failed to mint NFT invoice");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">RWA NFT Invoice Generator</h1>

      <WalletMultiButton className="mb-4" />

      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Bus ID"
          value={busId}
          onChange={(e) => setBusId(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Passenger Count"
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Total Revenue (SOL)"
          value={revenueSOL}
          onChange={(e) => setRevenueSOL(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={handleGenerateInvoice}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        Generate & Mint NFT
      </button>

      {invoice && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Invoice</h2>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border px-2 py-1 font-semibold">Bus ID</td>
                <td className="border px-2 py-1">{invoice.busId}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1 font-semibold">Date</td>
                <td className="border px-2 py-1">{invoice.date}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Passengers</td>
                <td className="border px-2 py-1">{invoice.passengers}</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Revenue</td>
                <td className="border px-2 py-1">{invoice.revenueSOL} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Gasoline</td>
                <td className="border px-2 py-1">{invoice.gasoline.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Taxes</td>
                <td className="border px-2 py-1">{invoice.taxes.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Bus Rent</td>
                <td className="border px-2 py-1">{invoice.busRent.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Maintenance</td>
                <td className="border px-2 py-1">{invoice.maintenance.toFixed(2)} ◎</td>
              </tr>
            </tbody>
          </table>

          {txSig && (
            <p className="mt-3 text-sm text-green-700 break-all">
              ✅ NFT minted successfully!<br />
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                View on Solana Explorer
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// WalletProvider wrapping
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
