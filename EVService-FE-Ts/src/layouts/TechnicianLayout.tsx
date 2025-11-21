import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TechnicianSidebar } from "@/components/TechnicianSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export const TechnicianLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <TechnicianSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader title="Cổng thông tin kỹ thuật viên" />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
