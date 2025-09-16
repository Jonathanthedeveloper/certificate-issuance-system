"use client";

import React from "react";
import Link from "next/link";
import { useStudent, useInstitutions } from "@/features";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  FileText,
  Edit,
  Plus,
  User,
  Building,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminStudentProfile({ id }: { id: string }) {
  const { data: student, isLoading, error } = useStudent(id);
  const { data: institutions = [] } = useInstitutions();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Student Not Found
              </h3>
              <p className="text-muted-foreground mb-4">
                The student you're looking for doesn't exist or has been
                removed.
              </p>
              <Button asChild>
                <Link href="/admin/students">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Students
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentInstitutions = student.institutions || [];
  const studentCertificates = student.certificates || [];
  const initials = `${student.firstName?.[0] || ""}${
    student.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/students">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Link>
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src=""
                  alt={`${student.firstName} ${student.lastName}`}
                />
                <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-600">
                  {initials || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  Matric Number: {student.matricNumber}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={student.isActive ? "default" : "secondary"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">
                    {studentInstitutions.length} Institution
                    {studentInstitutions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/admin/certificates/new?studentId=${student.id}`}>
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Certificate
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/admin/students/${student.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      First Name
                    </Label>
                    <p className="text-lg font-medium mt-1">
                      {student.firstName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Name
                    </Label>
                    <p className="text-lg font-medium mt-1">
                      {student.lastName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-lg">
                        {student.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Matric Number
                    </Label>
                    <p className="text-lg font-mono mt-1">
                      {student.matricNumber}
                    </p>
                  </div>
                  {student.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-lg">
                          {new Date(student.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificates ({studentCertificates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentCertificates.length > 0 ? (
                  <div className="space-y-4">
                    {studentCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Issued:{" "}
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={cert.isRevoked ? "destructive" : "default"}
                          >
                            {cert.isRevoked ? "Revoked" : "Active"}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/certificates/${cert.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No Certificates
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This student hasn't been issued any certificates yet.
                    </p>
                    <Button asChild>
                      <Link
                        href={`/admin/certificates/new?studentId=${student.id}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Issue First Certificate
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Institutions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Institutions ({studentInstitutions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentInstitutions.length > 0 ? (
                  <div className="space-y-4">
                    {studentInstitutions.map((si) => (
                      <div key={si.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <GraduationCap className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {si.institution.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {si.institution.type}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          {si.enrollmentDate && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Enrolled:
                              </span>
                              <span>
                                {new Date(
                                  si.enrollmentDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {si.graduationDate && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Graduated:
                              </span>
                              <span>
                                {new Date(
                                  si.graduationDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              variant={si.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {si.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Building className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No institutions assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Total Certificates
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {studentCertificates.length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Active Certificates
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {
                      studentCertificates.filter((cert) => !cert.isRevoked)
                        .length
                    }
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Institutions
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {studentInstitutions.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
