"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/providers/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Shield } from "lucide-react";
import { Role } from "@/lib/generated/prisma";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles,
  redirectTo = "/",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading, isAuthorized } = useRequireAuth(allowedRoles);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    } else if (!isLoading && user && !isAuthorized) {
      // Redirect based on user role if not authorized for current page
      if (user.role === Role.STUDENT) {
        router.push("/student");
      } else if (
        user.role === Role.INSTITUTION_ADMIN ||
        user.role === Role.STAFF ||
        user.role === Role.SUPER_ADMIN
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [user, isLoading, isAuthorized, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">Redirecting to login page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page. Redirecting...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
