import { LayoutDashboard, Calendar, Users, Wrench, MessageSquare, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authService } from "@/services/auth.ts";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/staff", icon: LayoutDashboard },
  { title: "Appointments", url: "/dashboard/staff/appointments", icon: Calendar },
  { title: "Customers", url: "/dashboard/staff/customers", icon: Users },
  { title: "Service Tickets", url: "/dashboard/staff/tickets", icon: Wrench },
  { title: "Messages", url: "/dashboard/staff/messages", icon: MessageSquare },
  { title: "Settings", url: "/dashboard/staff/settings", icon: Settings },
];

export function StaffSidebar() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Staff Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard/staff"}
                      className="flex items-center gap-2"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
