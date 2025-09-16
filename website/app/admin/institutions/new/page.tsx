"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateInstitution } from "@/features";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewInstitutionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contactEmail: "",
    website: "",
    isActive: true,
  });

  const createInstitution = useCreateInstitution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createInstitution.mutate(
      { ...formData },
      {
        onSuccess: () => {
          router.push("/admin/institutions");
        },
        onError: (error) => {
          console.error("Error creating institution:", error);
        },
      }
    );
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/institutions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Institutions
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Institution
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new educational institution profile
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="">
        <CardHeader>
          <CardTitle>Institution Details</CardTitle>
          <CardDescription>
            Enter the basic information for the new educational institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Massachusetts Institute of Technology"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Institution Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    handleInputChange("code", e.target.value.toUpperCase())
                  }
                  placeholder="e.g., MIT"
                  className="font-mono"
                  required
                />
                <p className="text-xs text-gray-500">
                  Unique identifier for the institution
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Full institutional address"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                  placeholder="registrar@institution.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://institution.edu"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  handleInputChange("isActive", checked)
                }
              />
              <Label htmlFor="isActive">Active Institution</Label>
              <p className="text-xs text-gray-500 ml-2">
                Only active institutions can issue certificates
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={createInstitution.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {createInstitution.isPending
                  ? "Creating..."
                  : "Create Institution"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/institutions">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
