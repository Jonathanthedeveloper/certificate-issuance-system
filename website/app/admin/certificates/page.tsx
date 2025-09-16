"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  Edit,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import solanaExplorer from "@/lib/solanaExplorer";
import { useCertificates, useInstitutions, useStudents } from "@/features";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  FilterFn,
} from "@tanstack/react-table";

type CertificateWithRelations = {
  id: string;
  title: string;
  certificateNumber: string;
  issueDate: Date;
  isRevoked: boolean;
  studentId: string;
  institutionId: string;
  student?: { firstName: string; lastName: string };
  institution?: { id: string; name: string };
  onChainId?: string | null;
  latestTxHash?: string | null;
};

const columns: ColumnDef<CertificateWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <Link
          href={`/admin/certificates/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.getValue("title")}
        </Link>
        {/* On-chain explorer quick link */}
        {(() => {
          const cert = row.original as CertificateWithRelations;
          const sig = cert.latestTxHash;
          const addr = cert.onChainId;
          const explorer = sig
            ? solanaExplorer.txUrl(sig)
            : addr
            ? solanaExplorer.addressUrl(addr)
            : null;
          return explorer ? (
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-gray-400 hover:text-gray-600"
              title="View on Solana Explorer"
            >
              <ExternalLink className="inline-block w-4 h-4" />
            </a>
          ) : null;
        })()}
        <div className="text-sm text-gray-500">
          #{row.original.certificateNumber}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "student",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const student = row.original.student;
      return student ? `${student.firstName} ${student.lastName}` : "Unknown";
    },
    filterFn: (row, id, value) => {
      const student = row.original.student;
      if (!student) return false;
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      return fullName.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "institution",
    header: "Institution",
    cell: ({ row }) => {
      const institution = row.original.institution;
      return institution?.name || "Unknown";
    },
    filterFn: (row, id, value) => {
      const institution = row.original.institution;
      if (!institution) return false;
      return institution.id === value;
    },
  },
  {
    accessorKey: "issueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Issue Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.getValue("issueDate")).toLocaleDateString();
    },
    filterFn: (row, id, value) => {
      if (!value) return true;
      const year = new Date(row.getValue("issueDate")).getFullYear().toString();
      return year === value;
    },
  },
  {
    accessorKey: "isRevoked",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("isRevoked") ? "destructive" : "default"}>
        {row.getValue("isRevoked") ? "Revoked" : "Active"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      if (!value) return true;
      return row.getValue("isRevoked") === value;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const certificate = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/certificates/${certificate.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            {/* View on-chain if available */}
            {(certificate.latestTxHash || certificate.onChainId) && (
              <DropdownMenuItem>
                <a
                  href={
                    certificate.latestTxHash
                      ? `https://explorer.solana.com/tx/${certificate.latestTxHash}?cluster=devnet`
                      : `https://explorer.solana.com/address/${certificate.onChainId}?cluster=devnet`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on chain
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/admin/certificates/${certificate.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {certificate.isRevoked ? "Restore" : "Revoke"} Certificate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useCertificates();
  const { data: students = [] } = useStudents();
  const { data: institutions = [] } = useInstitutions();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  // Prepare data with relations
  const certificatesWithRelations: CertificateWithRelations[] = useMemo(() => {
    return certificates.map((cert) => ({
      ...cert,
      student: cert.student,
      institution: cert.institution,
    }));
  }, [certificates]);

  // Extract unique years from certificates
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    certificates.forEach((cert) => {
      const year = new Date(cert.issueDate).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [certificates]);

  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: certificatesWithRelations,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600 mt-2">
            Manage and issue academic certificates
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/certificates/new">
            <Plus className="w-4 h-4 mr-2" />
            Issue Certificate
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search certificates..."
                className="pl-10"
                value={globalFilter ?? ""}
                onChange={(event) =>
                  setGlobalFilter(String(event.target.value))
                }
              />
            </div>
            <Select
              value={
                (table.getColumn("institution")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("institution")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Institutions</SelectItem>
                {institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={(() => {
                const filterValue = table
                  .getColumn("isRevoked")
                  ?.getFilterValue();
                if (filterValue === true) return "revoked";
                if (filterValue === false) return "active";
                return "all";
              })()}
              onValueChange={(value) => {
                if (value === "all") {
                  table.getColumn("isRevoked")?.setFilterValue("");
                } else if (value === "revoked") {
                  table.getColumn("isRevoked")?.setFilterValue(true);
                } else if (value === "active") {
                  table.getColumn("isRevoked")?.setFilterValue(false);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                (table.getColumn("issueDate")?.getFilterValue() as string) ??
                "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("issueDate")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Certificates ({table.getFilteredRowModel().rows.length})
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Showing {table.getRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} certificates
              </p>
            </div>
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
                <Button variant="outline" size="sm">
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading certificates...</span>
            </div>
          ) : (
            <>
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
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                        >
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
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} of{" "}
                  {table.getFilteredRowModel().rows.length} row(s) selected.
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {!isLoading && table.getRowModel().rows.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {certificates.length === 0
                ? "No certificates found"
                : "No certificates match your filters"}
            </h3>
            <p className="text-gray-600 mb-4">
              {certificates.length === 0
                ? "Start by issuing your first certificate to a student."
                : "Try adjusting your search or filter criteria."}
            </p>
            {certificates.length === 0 && (
              <Button asChild>
                <Link href="/admin/certificates/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Certificate
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
