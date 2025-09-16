"use client";

import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  Share,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useCertificate, useStudent } from "@/features";
import { useInstitution } from "@/features";
import { notFound } from "next/navigation";
import { shareCertificate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function StudentCertificateDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: certificate, isLoading: certLoading } = useCertificate(
    params.id
  );
  const { data: student } = useStudent(certificate?.studentId);
  const { data: institution } = useInstitution(certificate?.institutionId);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!certificate) return;

    const result = await shareCertificate({
      id: certificate.id,
      title: certificate.title,
      certificateNumber: certificate.certificateNumber,
      institution,
    });

    if (result.success) {
      if (result.fallback) {
        toast({
          title: "Link copied!",
          description: result.message,
        });
      } else {
        toast({
          title: "Shared successfully!",
          description: "Certificate link has been shared.",
        });
      }
    } else {
      toast({
        title: "Share failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  // Ensure we have the certificate before rendering the main UI
  if (!certificate) {
    if (certLoading) return <div className="py-12 text-center">Loading...</div>;
    return <div className="py-12 text-center">Certificate not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Certificates
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {certificate.title}
            </h1>
            <p className="text-gray-600 mt-2">
              Certificate #{certificate.certificateNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Certificate</CardTitle>
              <CardDescription>Official academic certificate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-blue-200 rounded-lg p-8 text-center space-y-6 shadow-lg">
                {/* Institution Header */}
                <div className="space-y-2">
                  <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">🎓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {institution?.name}
                  </h2>
                  <p className="text-gray-600">
                    Certificate of Academic Achievement
                  </p>
                </div>

                {/* Certificate Body */}
                <div className="border-t border-b border-blue-200 py-6 space-y-4">
                  <p className="text-gray-600">This is to certify that</p>
                  <h3 className="text-3xl font-bold text-gray-900">
                    {student?.firstName} {student?.lastName}
                  </h3>
                  <p className="text-gray-600">
                    has successfully completed the requirements for
                  </p>
                  <h4 className="text-xl font-semibold text-blue-900">
                    {certificate.title}
                  </h4>

                  {certificate.description && (
                    <p className="text-gray-700 italic max-w-md mx-auto">
                      {certificate.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-6">
                    <div>
                      <p className="text-sm text-gray-500">Completion Date</p>
                      <p className="font-semibold">
                        {certificate?.completionDate
                          ? new Date(
                              certificate.completionDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-semibold">
                        {certificate?.issueDate
                          ? new Date(certificate.issueDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {(certificate.gpa || certificate.honors) && (
                    <div className="flex justify-center gap-6 mt-4">
                      {certificate.gpa && (
                        <div>
                          <p className="text-sm text-gray-500">GPA</p>
                          <p className="font-semibold">{certificate.gpa}</p>
                        </div>
                      )}
                      {certificate.honors && (
                        <div>
                          <p className="text-sm text-gray-500">Honors</p>
                          <p className="font-semibold">{certificate.honors}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Certificate Footer */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Certificate Number</p>
                  <p className="font-mono text-sm font-semibold">
                    {certificate?.certificateNumber}
                  </p>
                  <p className="text-xs text-gray-400">
                    Verification Hash: {certificate?.verificationHash}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center">
                  <Badge
                    variant={certificate.isRevoked ? "destructive" : "default"}
                    className="px-4 py-2"
                  >
                    {certificate.isRevoked ? (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Revoked Certificate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valid Certificate
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Institution
                </Label>
                <p className="text-gray-900">{institution?.name}</p>
                <p className="text-sm text-gray-600">
                  {institution?.phoneNumber || institution?.website}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Program
                </Label>
                <p className="text-gray-900">{certificate.title}</p>
                {certificate.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {certificate.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Completed
                  </Label>
                  <p className="text-gray-900">
                    {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Issued
                  </Label>
                  <p className="text-gray-900">
                    {certificate.issueDate
                      ? new Date(certificate.issueDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {(certificate.gpa || certificate.honors) && (
                <div className="grid grid-cols-2 gap-4">
                  {certificate.gpa && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        GPA
                      </Label>
                      <p className="text-gray-900">{certificate.gpa}</p>
                    </div>
                  )}
                  {certificate.honors && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Honors
                      </Label>
                      <p className="text-gray-900">{certificate.honors}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Status
                </Label>
                <div className="mt-1">
                  <Badge
                    variant={certificate.isRevoked ? "destructive" : "default"}
                  >
                    {certificate.isRevoked ? "Revoked" : "Valid"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download PDF Certificate
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={handleShare}
              >
                <Share className="w-4 h-4 mr-2" />
                Share Certificate
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                asChild
              >
                <Link
                  href={`/verify?hash=${certificate.verificationHash}`}
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Public Verification
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Verification Hash
                  </Label>
                  <p className="text-sm text-gray-900 font-mono break-all bg-gray-50 p-2 rounded">
                    {certificate.verificationHash}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Anyone can verify this certificate using the hash above on our
                  public verification page.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full bg-transparent"
                >
                  <Link
                    href={`/verify?hash=${certificate.verificationHash}`}
                    target="_blank"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Verification Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`block text-sm font-medium ${className || ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
