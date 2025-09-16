"use client";

import {
  GraduationCap,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useVerifyCertificate } from "@/features";

export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const verifyCertificate = useVerifyCertificate();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim();
    // Update the URL so the verification is shareable (/verify?q=...)
    try {
      router.push(`${pathname}?q=${encodeURIComponent(q)}`);
    } catch (err) {
      // ignore routing errors
    }

    verifyCertificate.mutate(q);
  };

  // If the page is loaded with a ?q=... param, prefill and run verification.
  useEffect(() => {
    try {
      const qParam = searchParams?.get("q") ?? "";
      if (qParam && qParam !== query) {
        setQuery(qParam);
        verifyCertificate.mutate(qParam);
      }
    } catch (err) {
      // ignore malformed URL/search params
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.get("q")]);

  const renderResult = () => {
    if (!verifyCertificate.data && !verifyCertificate.error) return null;

    if (verifyCertificate.error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            An error occurred while verifying the certificate. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    const { verified, certificate, message, revokedReason, revokedDate } =
      verifyCertificate.data;

    if (!verified) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      );
    }

    if (certificate?.status === "revoked") {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This certificate has been revoked.
            {revokedReason && ` Reason: ${revokedReason}`}
            {revokedDate && ` (${new Date(revokedDate).toLocaleDateString()})`}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700 font-medium">
            ✅ Certificate is valid and authentic
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Certificate Number
                </p>
                <p className="font-mono">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Title</p>
                <p>{certificate.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Student</p>
                <p>
                  {certificate.student.firstName} {certificate.student.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Institution</p>
                <p>{certificate.institution.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Issue Date</p>
                <p>
                  {certificate.issueDate
                    ? new Date(certificate.issueDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Completion Date
                </p>
                <p>
                  {certificate.completionDate
                    ? new Date(certificate.completionDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {certificate.gpa && (
                <div>
                  <p className="text-sm font-medium text-gray-500">GPA</p>
                  <p>{certificate.gpa}</p>
                </div>
              )}
              {certificate.honors && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Honors</p>
                  <p>{certificate.honors}</p>
                </div>
              )}
            </div>
            {certificate.description && (
              <div>
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p>{certificate.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CertifyEdu</h1>
                <p className="text-sm text-gray-600">
                  Certificate Verification
                </p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Certificate Verification
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Verify the authenticity of academic certificates issued through
              our platform. Enter a certificate number or verification hash
              below.
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Verify Certificate
              </CardTitle>
              <CardDescription>
                Enter the certificate number or verification hash to check
                authenticity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">
                    Certificate Number or Verification Hash
                  </Label>
                  <Input
                    id="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., MIT-2024-CS-001 or abc123def456ghi789"
                    className="font-mono"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    You can find this information on the certificate document or
                    verification link
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyCertificate.isPending}
                >
                  <Search className="w-4 h-4 mr-2" />
                  {verifyCertificate.isPending
                    ? "Verifying..."
                    : "Verify Certificate"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {renderResult()}

          {/* Help Section */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">
                  Where to find verification information:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>
                    Certificate number is printed on the certificate document
                  </li>
                  <li>
                    Verification hash is provided with digital certificates
                  </li>
                  <li>
                    Both can be found in verification links shared by
                    certificate holders
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Verification process:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>
                    Our system checks against official institutional records
                  </li>
                  <li>Verification is performed in real-time</li>
                  <li>All verification attempts are logged for security</li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  If you believe there's an error with the verification result,
                  please contact the issuing institution directly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
