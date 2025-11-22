import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export const AdminLayout = () => {
  return (
    <SidebarProvider>

      <div className="h-screen w-full flex bg-background overflow-hidden">
        
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

          <DashboardHeader title="Admin Dashboard" />

          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};