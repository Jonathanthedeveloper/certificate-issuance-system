"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter, usePathname } from "next/navigation";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { useLogin, useProfile } from "@/features";
import { Role, type User } from "../lib/generated/prisma";

interface AuthContextType {
  user: User | null | undefined;
  status: Status;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const RolePages = {
  [Role.SUPER_ADMIN]: "/admin",
  [Role.STAFF]: "/admin",
  [Role.INSTITUTION_ADMIN]: "/admin",
  [Role.STUDENT]: "/student",
};

type Status = "authenticated" | "unauthenticated" | "loading";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const login = useLogin();
  const router = useRouter();
  const pathname = usePathname();
  const profile = useProfile();

  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      localStorage.removeItem("wallet_address");
      return;
    }

    login.mutate(wallet.publicKey.toString(), {
      onSuccess(data) {
        localStorage.setItem("wallet_address", data.user.walletAddress);
        if (!data.user.role) {
          router.push("/onboarding");
          return;
        }

        const expectedPath = RolePages[data.user.role] || "/";
        const isOnCorrectPath = pathname.startsWith(expectedPath);

        if (!isOnCorrectPath) {
          router.push(expectedPath);
        }
      },
    });
  }, [wallet.connected]);

  const status: Status = profile.data
    ? "authenticated"
    : login.isPending || profile.isPending
    ? "loading"
    : "unauthenticated";

  async function logout() {
    await wallet.disconnect();
    localStorage.removeItem("wallet_address");
    router.replace("/");
  }

  const value = {
    user: profile.data || login.data?.user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth(allowedRoles?: string[]) {
  const auth = useAuth();

  if (auth.isLoading) return { ...auth, isAuthorized: false };

  if (!auth.user) return { ...auth, isAuthorized: false };

  const isAuthorized =
    !allowedRoles ||
    (auth.user.role !== null && allowedRoles.includes(auth.user.role));

  return { ...auth, isAuthorized };
}
