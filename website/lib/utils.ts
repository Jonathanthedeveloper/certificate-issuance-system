import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import prisma from "./prisma";
import { NextResponse } from "next/server";
import { th } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWalletAddressFromHeaders(headers: Headers) {
  return headers.get("x-wallet-address");
}

type AuthConfig = {
  throwOnUnauthorized?: boolean;
};
export async function authenticate(
  headers: Headers,
  config: AuthConfig = {
    throwOnUnauthorized: true,
  }
) {
  const walletAddress = getWalletAddressFromHeaders(headers);
  // If no wallet header is present, caller should handle unauthorized response.
  if (!walletAddress) return null;

  // Look up the user by wallet address. Return null when not found.
  const user = await prisma.user.findUnique({ where: { walletAddress } });
  return user ?? null;
}

// Utility function to transform certificate data from API
export function transformCertificateData<T extends Record<string, any>>(
  data: T
): T {
  const dateFields = [
    "issueDate",
    "completionDate",
    "createdAt",
    "updatedAt",
    "revokedDate",
  ];
  const transformed = { ...data } as any;

  dateFields.forEach((field) => {
    if (transformed[field] && typeof transformed[field] === "string") {
      transformed[field] = new Date(transformed[field]);
    }
  });

  return transformed as T;
}

// Transform array of certificates
export function transformCertificatesData<T extends Record<string, any>[]>(
  certificates: T
): T {
  return certificates.map((cert) => transformCertificateData(cert)) as T;
}

// Share certificate using Web Share API with fallback
export async function shareCertificate(certificate: {
  id: string;
  title: string;
  certificateNumber: string;
  institution?: { name: string };
}) {
  const shareData = {
    title: certificate.title,
    text: `Check out my certificate: ${certificate.title} from ${
      certificate.institution?.name || "Institution"
    }`,
    url: `${window.location.origin}/verify?id=${certificate.id}`,
  };

  // Check if Web Share API is supported and available
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true };
    } catch (error) {
      // User cancelled share or error occurred
      console.log("Share cancelled or failed:", error);
      return { success: false, error: "Share cancelled" };
    }
  } else {
    // Fallback: Copy link to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      return {
        success: true,
        fallback: true,
        message: "Link copied to clipboard",
      };
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      return { success: false, error: "Unable to share or copy link" };
    }
  }
}
