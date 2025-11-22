import {LayoutDashboard, Calendar, ClipboardList, Settings, LogOut, Bell, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { authService } from "@/services/auth.ts";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
    { title: "Tổng quan", url: "/dashboard/technician", icon: LayoutDashboard },
    { title: "Lịch hẹn", url: "/dashboard/technician/appointments", icon: Calendar },
    { title: "Phiếu dịch vụ", url: "/dashboard/technician/tickets", icon: ClipboardList },
    { title: "Thông báo", url: "/dashboard/technician/notifications", icon: Bell },
    { title: 'Chứng chỉ', url: '/dashboard/technician/certificates', icon: Medal},
    { title: 'Cài đặt', url: '/dashboard/technician/settings', icon: Settings }
];

export function TechnicianSidebar() {
    const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getCurrentUser();
  const collapsed = state === 'collapsed';

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Đăng xuất",
      description: "Đã đăng xuất thành công",
    });
    navigate("/login");
  };

    return (
        <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
            <SidebarHeader className={`border-b border-sidebar-border p-4 flex ${collapsed ? 'justify-center' : ''}`}>
                <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-2'} font-bold text-sidebar-primary-foreground`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                        EV
                    </div>
                    {!collapsed && <span className="truncate font-semibold text-blue-900">EV Service</span>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className={collapsed ? "text-center px-0" : ""}>
                        {collapsed ? "Menu" : "Technician Dashboard"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/dashboard/technician"}
                                            className="hover:bg-muted/50"
                                            activeClassName="bg-primary/10 text-primary font-medium"
                                        >
                                            <item.icon
                                                className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"}
                                            />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"} />
                            {!collapsed && <span>Đăng xuất</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Hiển thị thông tin nhân viên khi sidebar mở rộng */}
                {!collapsed && user && (
                    <div className="px-3 py-2 text-xs text-muted-foreground border-t">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="truncate">{user.email}</p>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
