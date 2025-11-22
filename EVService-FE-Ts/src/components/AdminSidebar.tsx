import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  BarChart3,
  Settings,
  ChevronRight,
  User,
  Wrench,
  Briefcase,
  ShieldCheck,
  LogOut,
  Bell,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/auth";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // 1. Import thêm DropdownMenu

// Menu Items
const items = [
  {
    title: "Tổng quát",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  { title: "Thông báo", url: "/dashboard/admin/notifications", icon: Bell },
  {
    title: "Quản lý người dùng",
    icon: Users,
    isActive: true,
    items: [
      {
        title: "Khách hàng",
        url: "/dashboard/admin/users/CUSTOMER",
        icon: User,
      },
      {
        title: "Nhân viên",
        url: "/dashboard/admin/users/STAFF",
        icon: Briefcase,
      },
      {
        title: "Kỹ thuật viên",
        url: "/dashboard/admin/users/TECHNICIAN",
        icon: Wrench,
      },
      {
        title: "Quản trị viên",
        url: "/dashboard/admin/users/ADMIN",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Trung tâm dịch vụ",
    url: "/dashboard/admin/service-centers",
    icon: Building2,
  },
  {
    title: "Gói dịch vụ",
    url: "/dashboard/admin/packages",
    icon: Package,
  },
  {
    title: "Phụ tùng và dịch vụ ",
    icon: Wrench,
    isActive: true,
    items: [
      {
        title: "Phụ tùng",
        url: "/dashboard/admin/parts",
        icon: Package,
      },
      {
        title: "Dịch vụ",
        url: "/dashboard/admin/serviceitems",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Báo cáo & Thống kê",
    icon: BarChart3,
    isActive: true,
    items: [
      {
        title: "Chi tiết doanh thu",
        url: "/dashboard/admin/details",
        icon: BarChart3,
      },
      {
        title: "Lương nhân viên",
        url: "/dashboard/admin/employees-salary",
        icon: BarChart3,
      },
      {
        title: "Hiệu suất nhân viên",
        url: "/dashboard/admin/performance",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Cài đặt",
    url: "/dashboard/admin/settings",
    icon: Settings,
  },
  { title: "Quản lý Kho", url: "/dashboard/admin/inventory", icon: Package },
];

export function AdminSidebar() {
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
      <SidebarHeader
        className={`border-b border-sidebar-border p-4 flex ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center w-full" : "gap-2"
          } font-bold text-sidebar-primary-foreground`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
            EV
          </div>
          {!collapsed && (
            <span className="truncate font-semibold text-blue-900">
              EV Service
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "text-center px-0" : ""}>
            {collapsed ? "Menu" : "Quản lý"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                // Logic check active cho mục Cha
                const isParentActive = item.items?.some(
                  (sub) => location.pathname === sub.url
                );

                // TRƯỜNG HỢP 1: CÓ SUB-MENU VÀ SIDEBAR ĐANG ĐÓNG (COLLAPSED)

                if (item.items && collapsed) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={
                              isParentActive ? "bg-blue-50 text-blue-700" : ""
                            }
                          >
                            {item.icon && <item.icon />}
                            <span className="sr-only">{item.title}</span>
                          </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          side="right"
                          align="start"
                          className="min-w-[200px] ml-2"
                        >
                          <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {item.items.map((subItem) => (
                            <DropdownMenuItem key={subItem.title} asChild>
                              <NavLink
                                to={subItem.url}
                                className="flex items-center gap-2 cursor-pointer w-full"
                              >
                                {subItem.icon && (
                                  <subItem.icon className="h-4 w-4 opacity-70" />
                                )}
                                <span>{subItem.title}</span>
                              </NavLink>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  );
                }

                // TRƯỜNG HỢP 2: CÓ SUB-MENU VÀ SIDEBAR ĐANG MỞ (EXPANDED)

                if (item.items) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible
                        defaultOpen={item.isActive || isParentActive}
                        className="group/collapsible"
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={
                              isParentActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : ""
                            }
                          >
                            {item.icon && <item.icon />}
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink
                                    to={subItem.url}
                                    className="hover:bg-muted/50"
                                    activeClassName="bg-primary/10 text-primary font-medium"
                                  >
                                    {subItem.icon && (
                                      <subItem.icon className="h-4 w-4 mr-2" />
                                    )}
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                // TRƯỜNG HỢP 3: MENU ĐƠN LẺ (KHÔNG CÓ CON)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/dashboard/admin"}
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
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Đăng xuất"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"} />
              {!collapsed && <span>Đăng xuất</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {!collapsed && user && (
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-sidebar-border">
            <p className="font-medium truncate">
              {user.fullName || user.username || "Admin"}
            </p>
            <p className="truncate">{user.email}</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
