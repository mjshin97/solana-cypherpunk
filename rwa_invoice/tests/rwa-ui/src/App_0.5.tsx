import React, { useState } from "react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

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
  const { publicKey, connected } = useWallet();

  const [busId, setBusId] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(0);
  const [revenueSOL, setRevenueSOL] = useState(0);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const handleGenerateInvoice = async () => {
    if (!connected || !publicKey) {
      alert("Wallet not connected!");
      return;
    }

    // 간단한 예시 공식 (SOL 단위)
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
      console.log("Connected:", connected);
      console.log("Public Key:", publicKey.toBase58());
      console.log("Generated Invoice:", newInvoice);

      // 여기서 NFT 발행 트랜잭션 연동 가능
      setInvoice(newInvoice);
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">RWA NFT Invoice Generator (SOL)</h1>

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
        Generate Invoice
      </button>

      {invoice && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Invoice</h2>
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr className="border-b">
                <td className="border px-2 py-1 font-semibold">Bus ID</td>
                <td className="border px-2 py-1">{invoice.busId}</td>
              </tr>
              <tr className="border-b">
                <td className="border px-2 py-1 font-semibold">Date</td>
                <td className="border px-2 py-1">{invoice.date}</td>
              </tr>
              <tr className="border-b">
                <td className="border px-2 py-1 font-semibold">Passenger Count</td>
                <td className="border px-2 py-1">{invoice.passengers}</td>
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="border px-2 py-1 font-semibold">Total Revenue (SOL)</td>
                <td className="border px-2 py-1">{invoice.revenueSOL.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Gasoline (30%)</td>
                <td className="border px-2 py-1">{invoice.gasoline.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Taxes (10%)</td>
                <td className="border px-2 py-1">{invoice.taxes.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Bus Rent (25%)</td>
                <td className="border px-2 py-1">{invoice.busRent.toFixed(2)} ◎</td>
              </tr>
              <tr>
                <td className="border px-2 py-1">Maintenance (15%)</td>
                <td className="border px-2 py-1">{invoice.maintenance.toFixed(2)} ◎</td>
              </tr>
            </tbody>
          </table>
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
