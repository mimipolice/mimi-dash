import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardAnnouncements } from "@/components/dashboard-announcements";
import { auth } from "@/auth";
export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="px-4">
          <DashboardAnnouncements />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
