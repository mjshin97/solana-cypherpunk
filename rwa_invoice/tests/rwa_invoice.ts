import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { RwaInvoice } from "../target/types/rwa_invoice";

describe("rwa_invoice", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RwaInvoice as Program<RwaInvoice>;

  it("Creates an invoice", async () => {
    const invoice = anchor.web3.Keypair.generate();
    await program.methods.createInvoice("Bus001", "2025-10-23", 100, 5000)
      .accounts({
        invoice: invoice.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([invoice])
      .rpc();

    console.log("Invoice created:", invoice.publicKey.toBase58());
  });
});
