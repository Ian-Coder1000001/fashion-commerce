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
      <main
        id="main-content"
        className="flex-1 px-4 sm:px-6 md:px-10 pt-20 md:pt-8 pb-8 min-w-0"
      >
        {children}
      </main>
    </div>
  );
}
