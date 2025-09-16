import type React from "react";
import Link from "next/link";
import { FileText, GraduationCap, User } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Role } from "@/lib/generated/prisma";
import LogoutButton from "@/components/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={[Role.STUDENT]}>
      <div className="min-h-screen bg-gray-50">
        {/* Student Header */}
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
                    <p className="text-xs text-gray-600">Student Portal</p>
                  </div>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, John Doe</span>
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
                {
                  href: "/student",
                  label: "My Certificates",
                  icon: "FileText",
                },
                {
                  href: "/student/profile",
                  label: "Profile",
                  icon: "User",
                },
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
