"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Building2 } from "lucide-react";
import { Role } from "@/lib/generated/prisma";
import { toast } from "sonner";
import { useRegister } from "@/features";

// ✅ match server schema: institution nested, names separate
const schema = z.object({
  role: z.enum(Role).default(Role.INSTITUTION_ADMIN).optional(),
  firstName: z.string().min(2, "Admin first name required (min 2 chars)"),
  lastName: z.string().min(2, "Admin last name required (min 2 chars)"),
  email: z.string().email("Invalid email"),
  institution: z.object({
    name: z.string().min(2, "Institution name is required"),
    type: z.string().min(2, "Institution type required"),
    country: z.string().min(2, "Country required"),
    state: z.string().min(2, "State required"),
    city: z.string().min(2, "City required"),
    address: z.string().min(2, "Address required"),
    website: z.string().url("Invalid URL"),
    phoneNumber: z
      .string()
      .min(10, "Phone number min 10 chars")
      .max(15)
      .optional(),
    description: z.string().min(2).max(500).optional(),
    licenseNumber: z.string().min(2).max(100).optional(),
    accreditationBody: z.string().min(2).max(100).optional(),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterInstitutionPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        router.push("/admin");
      },
      onError: (error: any) => {
        toast.error(
          "Registration failed. Please check your details and try again."
        );
      },
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CertifyEdu</h1>
              <p className="text-sm text-gray-600">Certificate Verification</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="mt-10 px-6 py-4">
        <Card className="shadow-none border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl gap-3 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              Register Your Institution
            </CardTitle>
            <CardDescription className="text-lg">
              Join our platform to issue and manage digital certificates for
              your students
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Institution Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Institution Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name *</Label>
                    <Input
                      {...register("institution.name")}
                      placeholder="University of Excellence"
                    />
                    {errors.institution?.name && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.name.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Institution Type *</Label>
                    <Input
                      {...register("institution.type")}
                      placeholder="University"
                    />
                    {errors.institution?.type && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.type.message)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Country / State / City */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <Input
                      {...register("institution.country")}
                      placeholder="Country"
                    />
                    {errors.institution?.country && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.country.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input
                      {...register("institution.state")}
                      placeholder="State"
                    />
                    {errors.institution?.state && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.state.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      {...register("institution.city")}
                      placeholder="City"
                    />
                    {errors.institution?.city && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.city.message)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Textarea
                    {...register("institution.address")}
                    placeholder="Full Address"
                  />
                  {errors.institution?.address && (
                    <p className="text-sm text-red-600">
                      {String(errors.institution.address.message)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Website *</Label>
                    <Input
                      {...register("institution.website")}
                      placeholder="https://example.edu"
                    />
                    {errors.institution?.website && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.website.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      {...register("institution.phoneNumber")}
                      placeholder="+234 123 456 7890"
                    />
                    {errors.institution?.phoneNumber && (
                      <p className="text-sm text-red-600">
                        {String(errors.institution.phoneNumber.message)}
                      </p>
                    )}
                  </div>
                </div>

                <Textarea
                  {...register("institution.description")}
                  placeholder="Brief description..."
                  rows={4}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    {...register("institution.licenseNumber")}
                    placeholder="Registration / License Number"
                  />
                  <Input
                    {...register("institution.accreditationBody")}
                    placeholder="Accreditation Body"
                  />
                </div>
              </div>

              {/* Admin Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                  Primary Administrator Account
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admin First Name *</Label>
                    <Input
                      {...register("firstName")}
                      placeholder="Admin First Name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">
                        {String(errors.firstName.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Last Name *</Label>
                    <Input
                      {...register("lastName")}
                      placeholder="Admin Last Name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">
                        {String(errors.lastName.message)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="admin@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full my-10"
              >
                <Building2 className="w-5 h-5 mr-2" />
                {registerMutation.isPending
                  ? "Submitting Application..."
                  : "Submit Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
