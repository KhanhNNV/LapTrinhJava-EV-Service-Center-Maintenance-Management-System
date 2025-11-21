import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyNotifications } from "@/services/notificationService";
import { authService } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationBell() {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();

    const { data: notifications } = useMyNotifications(user?.id);


    const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

    // --- 🔥 HÀM MỚI: XÁC ĐỊNH ĐƯỜNG DẪN THEO ROLE ---
    const handleViewAll = () => {
        const role = user?.role;

        if (role === "STAFF") {
            navigate("/dashboard/staff/notifications");
        } else if (role === "TECHNICIAN") {
            navigate("/dashboard/technician/notifications");
        } else if (role === "ADMIN") {
            navigate("/dashboard/admin/notifications");
        } else {
            // Mặc định là Customer
            navigate("/dashboard/customer/notifications");
        }
    };
    // -------------------------------------------------

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white border-2 border-background animate-pulse">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-muted/10">
                    <h4 className="font-semibold">Thông báo</h4>
                    <p className="text-xs text-muted-foreground">Bạn có {unreadCount} tin chưa đọc</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {notifications?.slice(0, 5).map((noti: any) => (
                        <div
                            key={noti.notificationId}
                            className={`p-3 mb-2 rounded-lg text-sm cursor-pointer hover:bg-muted transition-colors ${!noti.isRead ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                            // 👇 SỬA: Gọi hàm handleViewAll thay vì navigate cứng
                            onClick={handleViewAll}
                        >
                            <p className="font-medium truncate">{noti.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{noti.message}</p>
                            <p className="text-[10px] text-right text-muted-foreground mt-1">
                                {new Date(noti.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    ))}
                    {(!notifications || notifications.length === 0) && (
                        <p className="text-center text-sm text-muted-foreground py-4">Không có thông báo nào</p>
                    )}
                </div>
                <div className="p-2 border-t text-center">
                    {/* 👇 SỬA: Gọi hàm handleViewAll thay vì navigate cứng */}
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleViewAll}>
                        Xem tất cả
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}