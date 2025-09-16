"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

type ConnectWalletButtonProps = {
  children?: React.ReactNode;
};

export default function ConnectWalletButton({
  children,
}: ConnectWalletButtonProps) {
  const { connected, publicKey } = useWallet();

  return (
    <WalletModalProvider>
      {connected ? (
        <WalletMultiButton className="" />
      ) : (
        <WalletMultiButton className="">
          {children ?? "Get Started"}
        </WalletMultiButton>
      )}
    </WalletModalProvider>
  );
}
