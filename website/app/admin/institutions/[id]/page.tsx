"use client";

import {
  ArrowLeft,
  Building,
  Calendar,
  Edit,
  FileText,
  LoaderCircleIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useCertificates, useInstitution, useStudents } from "@/features";
import { use } from "react";

export default function InstitutionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: institution, isPending: institutionPending } =
    useInstitution(id);

  const { data: institutionStudents = [] } = useStudents(id);
  const { data: institutionCertificates = [] } = useCertificates({
    institutionId: id,
  });

  if (!institution && !institutionPending) {
    notFound();
  }

  if (!institution && institutionPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoaderCircleIcon className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-4 items-start">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/institutions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Institutions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {institution.name}
            </h1>
            <p className="text-gray-600 mt-2">
              Institution Details and Statistics
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/institutions/${institution.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Institution
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institution Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Institution Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Institution Name
                  </Label>
                  <p className="text-gray-900">{institution.name}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Address
                </Label>
                <p className="text-gray-900">{institution.address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Contact Phone Number
                  </Label>
                  <p className="text-gray-900">{institution.phoneNumber}</p>
                </div>
                {institution.website && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Website
                    </Label>
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {institution.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant={institution.isActive ? "default" : "secondary"}
                    >
                      {institution.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Created
                  </Label>
                  <p className="text-gray-900">
                    {new Date(institution.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Certificates
              </CardTitle>
              <CardDescription>
                Latest certificates issued by this institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {institutionCertificates.length > 0 ? (
                <div className="space-y-3">
                  {institutionCertificates.map((cert) => {
                    const student = institutionStudents.find(
                      (s) => s.id === cert.studentId
                    );
                    return (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{cert.title}</p>
                          <p className="text-xs text-gray-600">
                            {student?.firstName} {student?.lastName} • #
                            {cert.certificateNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {new Date(cert.issueDate).toLocaleDateString()}
                          </p>
                          <Badge
                            variant={cert.isRevoked ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {cert.isRevoked ? "Revoked" : "Active"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No certificates issued yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Students</span>
                </div>
                <span className="font-semibold">
                  {institutionStudents.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Certificates</span>
                </div>
                <span className="font-semibold">
                  {institutionCertificates.length}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Active Since</span>
                </div>
                <span className="font-semibold text-sm">
                  {new Date(institution.createdAt).getFullYear()}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href={`/admin/students?institution=${institution.id}`}>
                  <Users className="w-4 h-4 mr-2" />
                  View Students
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link
                  href={`/admin/certificates?institution=${institution.id}`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Certificates
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Link href={`/admin/institutions/${institution.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
