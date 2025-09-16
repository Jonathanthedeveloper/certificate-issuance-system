"use client";

import { ArrowLeft, Eye, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCertificate, useInstitution, useProfile } from "@/features";
import { useStudents } from "@/features/students";

// Zod schema for certificate form validation
const certificateSchema = z.object({
  studentId: z.string().min(1, "Please select a student"),
  title: z.string().min(1, "Certificate title is required"),
  description: z.string().optional(),
  completionDate: z.string().min(1, "Completion date is required"),
  gpa: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 5),
      "GPA must be a number between 0 and 4"
    ),
  honors: z
    .enum(["none", "cumLaude", "magnaCumLaude", "summaCumLaude"])
    .optional(),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

export default function NewCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const currentUserInstitutionId = profile?.institutionId;
  const { data: institutionStudents = [], isLoading: studentsLoading } =
    useStudents(currentUserInstitutionId);
  const createCertificate = useCreateCertificate();
  const { data: currentInstitution } = useInstitution(currentUserInstitutionId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      studentId: "",
      title: "",
      description: "",
      completionDate: "",
      gpa: "",
      honors: "none",
    },
  });

  const watchedStudentId = watch("studentId");

  // Resolve the selected student once and prefer the Student model's own
  // firstName/lastName (they are required) and fall back to the linked
  // user object which may have nullable name fields. This avoids rendering
  // `null null` in the preview when the user record has empty names.
  const selectedStudent = institutionStudents.find(
    (s) => s.id === watchedStudentId
  );
  const previewFirstName =
    selectedStudent?.firstName || selectedStudent?.user?.firstName;
  const previewLastName =
    selectedStudent?.lastName || selectedStudent?.user?.lastName;

  // Handle URL parameters for pre-selecting student
  useEffect(() => {
    const studentId = searchParams.get("studentId");
    if (studentId && institutionStudents.length > 0) {
      // Check if the student exists in the loaded students data
      const studentExists = institutionStudents.some(
        (student) => student.id === studentId
      );
      if (studentExists) {
        setValue("studentId", studentId);
      }
    }
  }, [searchParams, institutionStudents, setValue]);

  const onSubmit = async (data: CertificateFormData) => {
    // Generate certificate number using current user's institution code
    // Use a short, deterministic institution code for the PDA seed to ensure the
    // certificateNumber seed stays <= 32 bytes. Strip hyphens from UUIDs and
    // take the first 8 characters.
    const shortInstitutionCode = profile?.institutionId
      ? profile.institutionId.replace(/-/g, "").slice(0, 8)
      : "GEN";
    const certificateNumber = `${shortInstitutionCode}-${new Date().getFullYear()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    // Normalize fields to match server validations:
    // - completionDate must be an ISO datetime string
    // - issueDate is an ISO datetime string
    // - gpa must be a number (or omitted)
    // - honors should be omitted when 'none' (server expects specific enums)
    const normalizedCompletionDate = data.completionDate
      ? new Date(data.completionDate).toISOString()
      : undefined;

    const normalizedGpa = data.gpa ? Number.parseFloat(data.gpa) : undefined;

    const certificateData = {
      ...data,
      institutionId: currentUserInstitutionId!,
      certificateNumber,
      issueDate: new Date().toISOString(),
      completionDate: normalizedCompletionDate,
      description: data.description || "",
      gpa: normalizedGpa,
      honors: data.honors === "none" ? undefined : data.honors,
    };

    createCertificate.mutate(certificateData, {
      onSuccess: () => {
        router.push("/admin/certificates");
      },
      onError: (error) => {
        console.error("Error creating certificate:", error);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/certificates">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Issue New Certificate
          </h1>
          <p className="text-gray-600 mt-2">
            Create and issue a new academic certificate for a student
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                Enter the information for the new certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student *</Label>
                  <Select
                    value={watchedStudentId}
                    onValueChange={(value) => setValue("studentId", value)}
                    disabled={profileLoading || studentsLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          profileLoading || studentsLoading
                            ? "Loading students..."
                            : "Select student from your institution"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName || student.user?.firstName}{" "}
                          {student.lastName || student.user?.lastName} (
                          {student.matricNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.studentId && (
                    <p className="text-sm text-red-600">
                      {errors.studentId.message}
                    </p>
                  )}
                  {institutionStudents.length === 0 && !studentsLoading && (
                    <p className="text-sm text-gray-500">
                      No students found for your institution.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Certificate Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Bachelor of Science in Computer Science"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Additional details about the certificate (optional)"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">Completion Date *</Label>
                    <Input
                      id="completionDate"
                      type="date"
                      {...register("completionDate")}
                    />
                    {errors.completionDate && (
                      <p className="text-sm text-red-600">
                        {errors.completionDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA (Optional)</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      {...register("gpa")}
                      placeholder="3.85"
                    />
                    {errors.gpa && (
                      <p className="text-sm text-red-600">
                        {errors.gpa.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="honors">Honors (Optional)</Label>
                    <Select
                      value={watch("honors")}
                      onValueChange={(value) =>
                        setValue("honors", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select honors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Honors</SelectItem>
                        <SelectItem value="cumLaude">Cum Laude</SelectItem>
                        <SelectItem value="magnaCumLaude">
                          Magna Cum Laude
                        </SelectItem>
                        <SelectItem value="summaCumLaude">
                          Summa Cum Laude
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.honors && (
                      <p className="text-sm text-red-600">
                        {errors.honors.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || createCertificate.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting || createCertificate.isPending
                      ? "Issuing Certificate..."
                      : "Issue Certificate"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/admin/certificates">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Certificate Preview
              </CardTitle>
              <CardDescription>
                Preview of how the certificate will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                  <div className="text-white font-bold text-xl">🎓</div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {currentInstitution?.name || "Institution Name"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Certificate of Completion
                  </p>
                </div>

                <div className="border-t border-b border-blue-200 py-4">
                  <p className="text-sm text-gray-600 mb-2">
                    This certifies that
                  </p>
                  <p className="font-bold text-lg text-gray-900">
                    {watchedStudentId && (previewFirstName || previewLastName)
                      ? `${previewFirstName ?? ""} ${
                          previewLastName ?? ""
                        }`.trim()
                      : "Student Name"}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    has successfully completed
                  </p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {watch("title") || "Certificate Title"}
                  </p>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {watch("completionDate") && (
                    <p>
                      Completed:{" "}
                      {new Date(watch("completionDate")!).toLocaleDateString()}
                    </p>
                  )}
                  {watch("gpa") && <p>GPA: {watch("gpa")}</p>}
                  {watch("honors") && watch("honors") !== "none" && (
                    <p>{watch("honors")}</p>
                  )}
                  <p>Certificate #: [Generated on issue]</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
