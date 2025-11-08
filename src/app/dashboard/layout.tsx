import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AnnouncementBanner } from "@/components/announcement-banner";
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
          <AnnouncementBanner
            id="1"
            title="系統維護公告"
            shortDescription="我們將於下週三凌晨 2 點至 4 點進行系統維護，屆時服務將會中斷。"
            url="/announcements/1"
            severity="warning"
          />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
