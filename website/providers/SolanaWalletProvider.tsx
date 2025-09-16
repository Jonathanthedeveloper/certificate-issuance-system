"use client";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { type FC, useMemo } from "react";

type Props = {
  readonly children: React.ReactNode;
};

const endpoint = clusterApiUrl("devnet");

export const SolanaWalletProvider: FC<Props> = ({ children }) => {
  const wallets = useMemo(() => [], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
