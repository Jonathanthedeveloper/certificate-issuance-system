import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import idl from "./idl.json";

const PROGRAM_ID = new PublicKey(
  "EB6wRW8YXSs2E1uWwuWC63V7t152eZpiESJ5AuWX4FEB"
);

// PDA helper
function getCertificatePda(certNumber: string): [PublicKey, number] {
  // The on-chain program computes the PDA using ["certificate", certificate_number]
  // so keep the client-side computation identical. Ensure the certificate_number
  // passed in is <= 32 bytes (enforced by the caller).
  const certBuf = Buffer.from(certNumber, "utf8");
  if (certBuf.length > 32) {
    throw new Error(
      `Certificate number seed too long: ${certBuf.length} bytes (max 32). ` +
        "Shorten the certificate number or update the on-chain PDA scheme."
    );
  }

  return PublicKey.findProgramAddressSync(
    [Buffer.from("certificate"), certBuf],
    PROGRAM_ID
  );
}

export function useCertIssuer() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Build Anchor program using connected wallet
  const provider = new anchor.AnchorProvider(connection, wallet as any, {
    preflightCommitment: "processed",
  });
  const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);

  /**
   * Issue certificate
   */
  async function issueCertificate(cert: {
    certificate_number: string;
    title: string;
    description?: string;
    issue_date: number;
    completion_date: number;
    gpa?: number;
    honors?: string;
  }) {
    const [certPda] = getCertificatePda(cert.certificate_number);
    const issueDateBn = new anchor.BN(cert.issue_date);
    const completionDateBn = new anchor.BN(cert.completion_date);

    const tx = await program.methods
      .issueCertificate(
        cert.certificate_number,
        cert.title,
        cert.description || null,
        issueDateBn,
        completionDateBn,
        cert.gpa ?? null,
        cert.honors || null
      )
      .accounts({
        certificate: certPda,
        authority: wallet.publicKey!,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    // refresh blockhash & payer
    const latest = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = wallet.publicKey!;

    try {
      const signature = await wallet.sendTransaction(tx, connection);

      await connection.confirmTransaction(
        {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        },
        "finalized"
      );

      return { pda: certPda, signature };
    } catch (err: any) {
      // If this is a SendTransactionError from web3, it often contains a getLogs()
      // helper with simulation logs. Call it to get full program logs for debugging.
      try {
        if (err && typeof err.getLogs === "function") {
          const simLogs = await err.getLogs();
          console.error("SendTransactionError simulation logs:", simLogs);
        } else if (err && err.logs) {
          // Some adapters expose logs directly
          console.error("SendTransactionError logs property:", err.logs);
        }
      } catch (logErr) {
        console.error("Failed to retrieve simulation logs:", logErr);
      }

      // Some wallet adapters throw an opaque WalletSendTransactionError.
      // Fall back to asking the wallet to sign the transaction and send the raw
      // serialized transaction via RPC. This works around adapter sendTransaction
      // implementations that fail for constructed tx objects.
      console.warn(
        "wallet.sendTransaction failed, falling back to sign+sendRaw:",
        err
      );

      // Refresh blockhash and fee payer before signing
      const latest2 = await connection.getLatestBlockhash("finalized");
      tx.recentBlockhash = latest2.blockhash;
      tx.feePayer = wallet.publicKey!;

      if (!wallet.signTransaction) {
        throw err;
      }

      const signed = await wallet.signTransaction(tx as any);
      const rawSig = await connection.sendRawTransaction(signed.serialize());

      await connection.confirmTransaction(
        {
          signature: rawSig,
          blockhash: latest2.blockhash,
          lastValidBlockHeight: latest2.lastValidBlockHeight,
        },
        "finalized"
      );

      return { pda: certPda, signature: rawSig };
    }
  }

  /**
   * Revoke certificate
   */
  async function revokeCertificate(certNumber: string, reason?: string) {
    const [certPda] = getCertificatePda(certNumber);
    const nowBn = new anchor.BN(Math.floor(Date.now() / 1000));

    const tx = await program.methods
      .revokeCertificate(reason || null, nowBn)
      .accounts({
        certificate: certPda,
        authority: wallet.publicKey!,
      })
      .transaction();

    const latest = await connection.getLatestBlockhash("finalized");
    tx.recentBlockhash = latest.blockhash;
    tx.feePayer = wallet.publicKey!;

    const signed = await wallet.signTransaction!(tx);
    const sig = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(
      {
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      },
      "finalized"
    );

    return { pda: certPda, signature: sig };
  }

  /**
   * Fetch certificate
   */
  async function fetchCertificate(certNumber: string) {
    const [certPda] = getCertificatePda(certNumber);
    return program.account.certificate.fetch(certPda);
  }

  return {
    issueCertificate,
    revokeCertificate,
    fetchCertificate,
  };
}
