import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

const AppContent = () => {
  const wallet = useWallet();

  const handleGenerateInvoice = () => {
    console.log("Connected:", wallet.connected);
    console.log("Public Key:", wallet.publicKey?.toBase58());

    if (!wallet.connected) {
      alert("Wallet not connected!");
      return;
    }

    alert("Invoice generation logic goes here!");
  };

  return (
    <div>
      <WalletMultiButton />
      <button onClick={handleGenerateInvoice}>Generate Invoice</button>
    </div>
  );
};

export default function App() {
  const network = "https://api.devnet.solana.com";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
