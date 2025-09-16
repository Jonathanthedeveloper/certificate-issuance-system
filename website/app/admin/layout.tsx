import {
  Building,
  FileText,
  GraduationCap,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { AuthGuard } from "@/components/auth-guard";
import LogoutButton from "@/components/logout-button";
import { Role } from "@/lib/generated/prisma";
import { SidebarNav } from "@/components/sidebar-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard
      allowedRoles={[Role.INSTITUTION_ADMIN, Role.STAFF, Role.SUPER_ADMIN]}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      CertifyEdu
                    </h1>
                    <p className="text-xs text-gray-600">Admin Portal</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)]">
            <SidebarNav
              items={[
                { href: "/admin", label: "Dashboard", icon: "Settings" },
                {
                  href: "/admin/institutions",
                  label: "Institutions",
                  icon: "Building",
                },
                {
                  href: "/admin/certificates",
                  label: "Certificates",
                  icon: "FileText",
                },
                { href: "/admin/students", label: "Students", icon: "Users" },
              ]}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
