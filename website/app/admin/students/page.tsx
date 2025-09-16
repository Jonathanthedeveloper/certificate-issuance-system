"use client";

import React, { useState, useMemo } from "react";
import {
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  Eye,
  Edit,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useProfile, useUserStudents } from "@/features";

import type { Prisma } from "@/lib/generated/prisma";

type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    institutions: true;
    certificates: true;
    user: true;
  };
}>;

const columns: ColumnDef<StudentWithRelations>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/students/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.original.firstName} {row.original.lastName}
        </Link>
        <div className="text-sm text-gray-500">{row.original.matricNumber}</div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-gray-400" />
        <span>{row.original.email || "No email"}</span>
      </div>
    ),
  },
  {
    accessorKey: "certificates",
    header: "Certificates",
    cell: ({ row }) => {
      const certificates = row.original.certificates || [];
      return (
        <div className="text-center">
          <span className="font-medium">{certificates.length}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.original.isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
    filterFn: (row, id, value) => {
      if (value === "") return true;
      return row.original.isActive === (value === "active");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/students/${student.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/certificates/new?studentId=${student.id}`}>
                <FileText className="w-4 h-4 mr-2" />
                Issue Certificate
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/students/${student.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function StudentsPage() {
  const { data: profile } = useProfile();
  const currentUserInstitutionId = profile?.institutionId;
  const { data: institutionStudents = [] } = useUserStudents();

  const institution = profile?.institution;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: institutionStudents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">
            Manage student records for{" "}
            {currentUserInstitutionId
              ? institution?.name || "your institution"
              : "All institutions"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/students/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            </div>
            <Select
              value={
                (table.getColumn("isActive")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("isActive")
                  ?.setFilterValue(value === "all" ? "" : value === "active")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students ({institutionStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} student(s) shown.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
