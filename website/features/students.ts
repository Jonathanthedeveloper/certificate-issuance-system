import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Prisma, Student } from "@/lib/generated/prisma";

type StudentWithUser = Prisma.StudentGetPayload<{
  include: {
    user: true;
  };
}>;

export function useStudents(institutionId?: string | null) {
  return useQuery({
    queryKey: ["students", institutionId],
    queryFn: async () => {
      const url = institutionId
        ? `/api/students?institutionId=${institutionId}`
        : "/api/students";
      const res = await api.get<{ students: StudentWithUser[] }>(url);
      return res.data.students;
    },
    enabled: typeof window !== "undefined",
  });
}

type StudentWithInstitutions = Prisma.StudentGetPayload<{
  include: {
    institutions: {
      include: {
        institution: true;
      };
    };
    certificates: true;
    user: true;
  };
}>;

export function useStudent(id?: string) {
  return useQuery({
    queryKey: ["student", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const res = await api.get<{ student: StudentWithInstitutions }>(
        `/api/students?id=${id}`
      );
      return res.data.student;
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["student", "create"],
    mutationFn: async (payload: any) => {
      const res = await api.post("/api/students", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["student", "update"],
    mutationFn: async (payload: any) => {
      const res = await api.put("/api/students", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["student", "delete"],
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/students?id=${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

type StudentWithDetails = Prisma.StudentGetPayload<{
  include: {
    institutions: true;
    certificates: true;
    user: true;
  };
}>;

export function useUserStudents() {
  return useQuery({
    queryKey: ["students", "user"],
    queryFn: async () => {
      const res = await api.get<{ students: StudentWithDetails[] }>(
        "/api/students/me"
      );
      return res.data.students;
    },
  });
}
