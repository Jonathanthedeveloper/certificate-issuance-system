"use client";

import {
  Building,
  FileText,
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCertificates, useInstitutions, useProfile } from "@/features";
import { AsyncState } from "@/components/ui/async-state";

export default function AdminDashboard() {
  const { data: profile, isPending: profileLoading } = useProfile();
  const { data: institutions = [], isPending: institutionsLoading } =
    useInstitutions();
  const { data: certificates = [], isPending: certificatesLoading } =
    useCertificates();

  const isLoading =
    profileLoading || institutionsLoading || certificatesLoading;

  // Calculate stats
  const activeCertificates = certificates.filter((cert) => !cert.isRevoked);
  const revokedCertificates = certificates.filter((cert) => cert.isRevoked);
  const recentCertificates = certificates
    .sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    )
    .slice(0, 5);

  const stats = {
    totalInstitutions: institutions.length,
    totalCertificates: certificates.length,
    activeCertificates: activeCertificates.length,
    revokedCertificates: revokedCertificates.length,
  };

  return (
    <AsyncState loading={isLoading}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {profile?.firstName} {profile?.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/certificates/new">Issue Certificate</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile?.role === "SUPER_ADMIN"
                  ? "Total Institutions"
                  : "My Institution"}
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.role === "SUPER_ADMIN" ? stats.totalInstitutions : 1}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.role === "SUPER_ADMIN"
                  ? "Active institutions"
                  : profile?.institution?.name}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Certificates
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalCertificates}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                All time issued
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Certificates
              </CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeCertificates}
              </div>
              <p className="text-xs text-muted-foreground">Currently valid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revoked Certificates
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.revokedCertificates}
              </div>
              <p className="text-xs text-muted-foreground">
                Invalidated certificates
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Certificates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Certificates</CardTitle>
              <CardDescription>
                Latest certificates issued in your institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCertificates.length > 0 ? (
                <div className="space-y-4">
                  {recentCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{cert.title}</h4>
                        <p className="text-xs text-gray-600">
                          {cert.student?.firstName} {cert.student?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
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
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/certificates">
                        View All Certificates
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm">No certificates issued yet</p>
                  <Button className="mt-4" asChild>
                    <Link href="/admin/certificates/new">
                      Issue First Certificate
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button asChild className="justify-start">
                  <Link href="/admin/certificates/new">
                    <FileText className="mr-2 h-4 w-4" />
                    Issue New Certificate
                  </Link>
                </Button>
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/admin/students">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Students
                  </Link>
                </Button>
                {profile?.role === "SUPER_ADMIN" && (
                  <Button variant="outline" asChild className="justify-start">
                    <Link href="/admin/institutions">
                      <Building className="mr-2 h-4 w-4" />
                      Manage Institutions
                    </Link>
                  </Button>
                )}
                <Button variant="outline" asChild className="justify-start">
                  <Link href="/verify">
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AsyncState>
  );
}
