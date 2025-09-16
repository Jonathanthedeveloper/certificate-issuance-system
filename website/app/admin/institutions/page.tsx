"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Building,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserInstitutions } from "@/features";

export default function InstitutionsPage() {
  const { data: institutions = [] } = useUserInstitutions();
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600 mt-2">
            Manage educational institutions and their settings
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/institutions/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Institution
          </Link>
        </Button>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((institution) => (
          <Card
            key={institution.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {institution.name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {institution.phoneNumber || institution.website}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/institutions/${institution.id}`}>
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/institutions/${institution.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      Deactivate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{institution.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">
                  {institution.phoneNumber || institution.website}
                </span>
              </div>

              {institution.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <a
                    href={institution.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {institution.website.replace("https://", "")}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Badge variant={institution.isActive ? "default" : "secondary"}>
                  {institution.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/institutions/${institution.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no institutions) */}
      {institutions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No institutions found
            </h3>
            <p className="text-gray-600 mb-4">
              Get started by adding the first educational institution.
            </p>
            <Button asChild>
              <Link href="/admin/institutions/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Institution
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
