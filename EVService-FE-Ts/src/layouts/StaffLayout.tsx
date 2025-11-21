import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StaffSidebar } from "@/components/StaffSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export const StaffLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <StaffSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader title="Cổng thông tin nhân viên" />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
