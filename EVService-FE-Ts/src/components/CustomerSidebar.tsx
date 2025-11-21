import {
  Car,
  Calendar,
  History,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.ts';
import { toast } from 'sonner';

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
  SidebarHeader,
} from '@/components/ui/sidebar';

const menuItems = [
  { title: 'Tổng quan', url: '/dashboard/customer', icon: LayoutDashboard },
  { title: 'Xe của tôi', url: '/dashboard/customer/vehicles', icon: Car },
  { title: 'Đặt lịch hẹn', url: '/dashboard/customer/appointments', icon: Calendar },
  { title: 'Lịch sử', url: '/dashboard/customer/history', icon: History },
  { title: 'Thanh toán', url: '/dashboard/customer/payments', icon: CreditCard }, 
  { title: 'Thông báo', url: '/dashboard/customer/notifications', icon: Bell },
  { title: 'Cài đặt', url: '/dashboard/customer/settings', icon: Settings },
  { title: "Hỗ trợ trực tuyến", url: "/dashboard/customer/messages", icon: MessageSquare,},
];

export function CustomerSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname; // Biến này có thể dùng để check active nếu cần logic phức tạp hơn
  const user = authService.getCurrentUser();

  const collapsed = state === 'collapsed';

  const handleLogout = () => {
    authService.logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/login');
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
          <SidebarGroupLabel className={collapsed ? 'text-center px-0' : ''}>
            {collapsed ? 'Menu' : 'Customer Dashboard'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard/customer'}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className={collapsed ? 'mx-auto' : 'mr-2 h-4 w-4'} />
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
            <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className={collapsed ? 'mx-auto' : 'mr-2 h-4 w-4'} />
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