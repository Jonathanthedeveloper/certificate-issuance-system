"use client";

import {
  BookUserIcon,
  GraduationCapIcon,
  type LucideIcon,
  School2Icon,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLES: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    id: "staff",
    title: "Staff",
    icon: User,
    description: "Issue and manage certificates on behalf of an institution.",
  },
  {
    id: "institution",
    icon: School2Icon,
    title: "Institution",
    description: "Register an institution and configure certificate templates.",
  },
  {
    id: "student",
    title: "Student",
    icon: BookUserIcon,
    description: "Claim certificates and manage your personal profile.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  function selectRole(roleId: string) {
    router.push(`/onboarding/${roleId}`);
  }

  return (
    <div className="container ">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <GraduationCapIcon className="w-6 h-6 text-white" />
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

      <div className="w-full max-w-4xl mx-auto mt-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold">Welcome, choose your role</h1>
          <p className="text-muted-foreground mt-2">
            Pick the role that best describes you
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          role="radiogroup"
        >
          {ROLES.map((role) => (
            <Card
              key={role.id}
              className="flex flex-col items-stretch cursor-pointer"
              onClick={() => selectRole(role.id)}
            >
              <CardHeader className="items-center gap-4">
                <div className="space-y-4">
                  <div>
                    <role.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{role.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
