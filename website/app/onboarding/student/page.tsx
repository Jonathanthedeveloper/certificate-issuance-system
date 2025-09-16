"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstitutions, useRegister } from "@/features";
import { Role } from "@/lib/generated/prisma";

const schema = z.object({
  role: z.enum(Role).default(Role.STUDENT).optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  matricNumber: z.string().min(1, "Matric number is required"),
  email: z.email("Invalid email address"),
  institutionId: z.string().min(1, "Institution is required"),
});

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const { data: institutions = [] } = useInstitutions();
  const router = useRouter();

  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      institutionId: "",
      matricNumber: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        router.replace("/student");
      },
      onError: () => {
        // TODO: show an error alert here if needed
      },
    });
  };

  const institutionId = watch("institutionId");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">CertifyEdu</h1>
              <p className="text-sm text-gray-600">Certificate Management</p>
            </div>
          </Link>
        </div>

        {/* Signup Form */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Join the certificate management platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john.doe@university.edu"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matricNumber">Matric Number</Label>
                <Input
                  id="matricNumber"
                  type="text"
                  {...register("matricNumber")}
                  placeholder="12345678"
                />
                {errors.matricNumber && (
                  <p className="text-sm text-red-600">
                    {errors.matricNumber.message}
                  </p>
                )}
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <Label htmlFor="institutionId">Institution</Label>
                <Select
                  value={institutionId}
                  onValueChange={(value) => setValue("institutionId", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.institutionId && (
                  <p className="text-sm text-red-600">
                    {errors.institutionId.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit" // ✅ FIX: should be "submit"
                disabled={registerMutation.isPending}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
