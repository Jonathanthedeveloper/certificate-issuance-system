import AdminStudentProfile from "@/components/admin/student-profile";

export default function AdminStudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  return <AdminStudentProfile id={params.id} />;
}
