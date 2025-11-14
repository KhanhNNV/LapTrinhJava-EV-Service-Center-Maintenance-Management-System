import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CustomerSidebar } from '@/components/CustomerSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';

export const CustomerLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CustomerSidebar />
        <main className="flex-1 flex flex-col">
          <DashboardHeader title="Customer Dashboard" />
          <div className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
