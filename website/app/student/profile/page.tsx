"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { useProfile } from "@/features";
import api from "@/lib/api";

const profileSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function StudentProfilePage() {
  const { data: profile } = useProfile();

  const qc = useQueryClient();

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
    },
  });

  useEffect(() => {
    const student = profile?.student;
    if (student) {
      reset({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        dateOfBirth:
          student.dateOfBirth instanceof Date
            ? student.dateOfBirth.toISOString().split("T")[0]
            : student.dateOfBirth || "",
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: async (payload: ProfileForm) => {
      const res = await api.put("/api/auth/profile", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const onSubmit = async (values: ProfileForm) => {
    await updateMutation.mutateAsync(values);
  };

  const isLoading = updateMutation.status === "pending";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and account settings
        </p>
      </div>
      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
