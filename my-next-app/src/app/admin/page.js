import ProtectAdminRoute from "@/app/Components/protectedroute";

export default function AdminDashboard() {
  return (
    <ProtectAdminRoute>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>Welcome to the admin panel!</p>
    </ProtectAdminRoute>
  );
}
