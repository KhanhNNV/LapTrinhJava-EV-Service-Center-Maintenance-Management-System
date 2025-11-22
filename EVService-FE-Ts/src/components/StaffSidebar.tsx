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
import { useConversations } from "@/services/chatService";
// Bạn có thể bỏ import Badge nếu không dùng ở đâu khác, hoặc giữ lại
// import { Badge } from "@/components/ui/badge";

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
    useSidebar, SidebarHeader,
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

    const { data: conversations } = useConversations();

    // Tính toán số lượng tin nhắn mới
    const newMessagesCount = conversations?.filter(c => c.status === 'NEW').length || 0;

    const collapsed = state === "collapsed";

    const handleLogout = () => {
        authService.logout();
        toast.success("Đã đăng xuất thành công");
        navigate("/login");
    };

    return (
        <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
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
                        {collapsed ? "Menu" : "Staff Dashboard"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            end={item.url === "/dashboard/staff"}
                                            className="hover:bg-muted/50 relative flex items-center"
                                            activeClassName="bg-primary/10 text-primary font-medium"
                                        >
                                            <div className="relative">
                                                <item.icon className={collapsed ? "mx-auto" : "mr-2 h-4 w-4"} />

                                                {/* Chấm đỏ khi thu gọn Sidebar (Collapsed) */}
                                                {collapsed && item.url === "/dashboard/staff/messages" && newMessagesCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-600 border border-white"></span>
                                                )}
                                            </div>

                                            {!collapsed && (
                                                <>
                                                    <span className="flex-1">{item.title}</span>

                                                    {/* --- THAY ĐỔI Ở ĐÂY --- */}
                                                    {/* Thay vì hiển thị Badge số lượng, chỉ hiển thị chấm đỏ */}
                                                    {item.url === "/dashboard/staff/messages" && newMessagesCount > 0 && (
                                                        <span className="ml-auto h-2.5 w-2.5 rounded-full bg-red-600"></span>
                                                    )}
                                                </>
                                            )}
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