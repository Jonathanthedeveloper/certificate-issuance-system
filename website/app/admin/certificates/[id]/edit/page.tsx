"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
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
import { useCertificate, useUpdateCertificate } from "@/features";
import { AsyncState } from "@/components/ui/async-state";
import { useToast } from "@/hooks/use-toast";
import { use } from "react";

export default function EditCertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { id } = use(params);

  const { data: certificate, isPending, isError } = useCertificate(id);
  const updateCertificate = useUpdateCertificate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    completionDate: "",
    gpa: "",
    honors: "",
  });

  useEffect(() => {
    if (certificate) {
      setFormData({
        title: certificate.title || "",
        description: certificate.description || "",
        completionDate: certificate.completionDate
          ? new Date(certificate.completionDate).toISOString().split("T")[0]
          : "",
        gpa: certificate.gpa?.toString() || "",
        honors: certificate.honors || "none",
      });
    }
  }, [certificate]);

  if (isError || (!certificate && !isPending)) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      id: certificate!.id,
      title: formData.title,
      description: formData.description || undefined,
      completionDate: formData.completionDate
        ? new Date(formData.completionDate).toISOString()
        : undefined,
      gpa: formData.gpa ? Number.parseFloat(formData.gpa) : undefined,
      honors:
        formData.honors === "none" ? undefined : formData.honors || undefined,
    };

    updateCertificate.mutate(updateData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Certificate updated successfully",
        });
        router.push(`/admin/certificates/${certificate!.id}`);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description:
            error.response?.data?.error || "Failed to update certificate",
          variant: "destructive",
        });
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AsyncState loading={isPending}>
      {certificate && (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-4">
            <Button variant="ghost" asChild>
              <Link href={`/admin/certificates/${certificate.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Certificate
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Certificate
              </h1>
              <p className="text-gray-600 mt-2">
                Certificate #{certificate.certificateNumber}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Details</CardTitle>
                  <CardDescription>
                    Update the certificate information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Certificate Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="completionDate">Completion Date</Label>
                      <Input
                        id="completionDate"
                        type="date"
                        value={formData.completionDate}
                        onChange={(e) =>
                          handleInputChange("completionDate", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gpa">GPA (Optional)</Label>
                        <Input
                          id="gpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={formData.gpa}
                          onChange={(e) =>
                            handleInputChange("gpa", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="honors">Honors (Optional)</Label>
                        <Select
                          value={formData.honors}
                          onValueChange={(value) =>
                            handleInputChange("honors", value)
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
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={updateCertificate.isPending}
                      >
                        {updateCertificate.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {updateCertificate.isPending
                          ? "Updating..."
                          : "Update Certificate"}
                      </Button>
                      <Button type="button" variant="outline" asChild>
                        <Link href={`/admin/certificates/${certificate.id}`}>
                          Cancel
                        </Link>
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
                  <CardTitle>Certificate Preview</CardTitle>
                  <CardDescription>
                    Preview of updated certificate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center">
                      <div className="text-white font-bold text-xl">🎓</div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {certificate.institution?.name}
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
                        {certificate.student?.firstName}{" "}
                        {certificate.student?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        has successfully completed
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {formData.title || certificate.title}
                      </p>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      {formData.completionDate && (
                        <p>
                          Completed:{" "}
                          {new Date(
                            formData.completionDate
                          ).toLocaleDateString()}
                        </p>
                      )}
                      {formData.gpa && <p>GPA: {formData.gpa}</p>}
                      {formData.honors && <p>{formData.honors}</p>}
                      <p>Certificate #: {certificate.certificateNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AsyncState>
  );
}
