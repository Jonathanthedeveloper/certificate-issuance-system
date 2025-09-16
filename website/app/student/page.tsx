"use client";

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
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Eye,
  Share,
  Search,
  Calendar,
  Award,
} from "lucide-react";

import {
  useCertificates,
  useInstitution,
  useProfile,
  useStudent,
  useStudents,
  useUserCertificates,
} from "@/features";
import type { Certificate } from "@/lib/generated/prisma";
import { shareCertificate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { data: profile } = useProfile();
  const { data: students = [] } = useStudents();

  const { data: certificates = [] } = useUserCertificates();

  const studentProfile = students?.find((s) => s.userId === profile?.id);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {studentProfile?.firstName}!
            </h1>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{certificates.length}</div>
            <div className="text-blue-100 text-sm">Certificates Earned</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Certificates
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates.length}</div>
            <p className="text-xs text-muted-foreground">Issued certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Certificate
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificates.length > 0 && certificates[0].issueDate
                ? new Date(certificates[0].issueDate).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent issue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Honors Received
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {certificates.filter((c) => c.honors).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Certificates with honors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My Certificates</CardTitle>
          <CardDescription>
            View and manage your academic certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your certificates..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Certificates Grid */}
          {certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-600">
                Your certificates will appear here once they are issued by your
                institution.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: Certificate }) {
  const { data: institution } = useInstitution(certificate.institutionId);
  const { toast } = useToast();

  const handleShare = async () => {
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

  return (
    <Card
      key={certificate.id}
      className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-tight">
              {certificate.title}
            </CardTitle>
            <CardDescription>{institution?.name ?? ""}</CardDescription>
          </div>
          <Badge variant={certificate.isRevoked ? "destructive" : "default"}>
            {certificate.isRevoked ? "Revoked" : "Valid"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Issue Date</p>
            <p className="font-medium">
              {certificate.issueDate
                ? new Date(certificate.issueDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Certificate #</p>
            <p className="font-mono text-xs">{certificate.certificateNumber}</p>
          </div>
        </div>

        {(certificate.gpa || certificate.honors) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {certificate.gpa && (
              <div>
                <p className="text-gray-500">GPA</p>
                <p className="font-medium">{certificate.gpa}</p>
              </div>
            )}
            {certificate.honors && (
              <div>
                <p className="text-gray-500">Honors</p>
                <p className="font-medium">{certificate.honors}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/student/certificates/${certificate.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
