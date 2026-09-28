import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getStoreSettings } from "@/services/settings.service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar storeName={settings.storeName} />
      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}