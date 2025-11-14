import { LayoutDashboard, Users, Building2, Package, Wrench, BarChart3, Settings, LogOut } from "lucide-react";
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
import { authService } from "@/services/auth/auth";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", url: "/dashboard/admin", icon: LayoutDashboard },
  { title: "Users", url: "/dashboard/admin/users", icon: Users },
  { title: "Service Centers", url: "/dashboard/admin/service-centers", icon: Building2 },
  { title: "Parts Inventory", url: "/dashboard/admin/parts", icon: Package },
  { title: "Service Packages", url: "/dashboard/admin/packages", icon: Wrench },
  { title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/admin/settings", icon: Settings },
];

export function AdminSidebar() {
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
          <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      end={item.url === "/dashboard/admin"}
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
