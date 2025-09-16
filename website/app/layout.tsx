import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { SolanaWalletProvider } from "@/providers/SolanaWalletProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CertifyEdu - Certificate Management System",
  description:
    "Secure digital certificate management for educational institutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider>
          <ThemeProvider>
            <SolanaWalletProvider>
              <AuthProvider>{children}</AuthProvider>
            </SolanaWalletProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
