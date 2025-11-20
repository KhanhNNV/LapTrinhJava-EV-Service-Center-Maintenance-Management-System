import { useMyNotifications, useMarkNotificationAsRead, useDeleteNotification } from "@/services/notificationService";
import { authService } from "@/services/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function StaffNotifications() {
    const currentUser = authService.getCurrentUser();

    const { data: notifications, isLoading } = useMyNotifications(currentUser?.id);
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteMutation = useDeleteNotification();

    if (isLoading) return <div className="p-6">Đang tải thông báo...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Thông báo công việc</h2>
                    <p className="text-muted-foreground">Cập nhật mới nhất từ hệ thống</p>
                </div>
            </div>

            <div className="grid gap-4">
                {notifications?.length > 0 ? (
                    notifications.map((noti: any) => (
                        <Card
                            key={noti.notificationId}
                            className={`shadow-sm transition-all hover:shadow-md ${
                                !noti.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/50" : "opacity-80"
                            }`}
                        >
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className={`p-2 rounded-full ${!noti.isRead ? "bg-blue-100 text-blue-600" : "bg-muted text-muted-foreground"}`}>
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-base ${!noti.isRead ? "font-bold text-blue-900" : "font-medium text-muted-foreground"}`}>
                                            {noti.title}
                                        </h4>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                                            {noti.createdAt ? format(new Date(noti.createdAt), "dd/MM HH:mm", { locale: vi }) : ""}
                    </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{noti.message}</p>

                                    <div className="flex gap-2 mt-2 justify-end">
                                        {!noti.isRead && (
                                            <Button variant="ghost" size="sm" className="h-8" onClick={() => markAsReadMutation.mutate(noti.notificationId)}>
                                                <Check className="w-3 h-3 mr-1" /> Đã xem
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(noti.notificationId)}>
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Bạn chưa có thông báo nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}