import {
  LayoutDashboard,
  Calendar,
  Users,
  Wrench,
  DollarSign,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.ts";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Tổng quan", url: "/dashboard/staff", icon: LayoutDashboard },
  { title: "Lịch hẹn", url: "/dashboard/staff/appointments", icon: Calendar },
  { title: "Khách hàng", url: "/dashboard/staff/customers", icon: Users },
  { title: "Báo giá", url: "/dashboard/staff/quotes", icon: DollarSign },
  { title: "Tin nhắn", url: "/dashboard/staff/messages", icon: MessageSquare },
  { title: "Cài đặt", url: "/dashboard/staff/settings", icon: Settings },
];

export function StaffSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const collapsed = state === "collapsed";

  const handleLogout = () => {
    authService.logout();
    toast.success("Đã đăng xuất thành công");
    navigate("/login");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "text-center px-0" : ""}>
            {collapsed ? "Menu" : "Staff Dashboard"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard/staff"} // chính xác trang chủ staff
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
