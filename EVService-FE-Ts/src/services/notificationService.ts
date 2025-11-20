import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { toast } from "sonner";

export interface Notification {
    notificationId: number;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    userId: number;
}

export function useMyNotifications(userId: number | undefined) {
    return useQuery({
        queryKey: ["notifications", userId],
        queryFn: async () => {
            if (!userId) return [];
            const response = await api.get(`/api/notifications/user/${userId}`);

            // 2. Ép kiểu dữ liệu trả về thành mảng Notification
            const data = response.data as Notification[];

            // 3. Dùng kiểu Notification thay vì 'any' trong hàm sort
            return data.sort((a: Notification, b: Notification) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        },
        enabled: !!userId,
        refetchInterval: 5000,
    });
}

// 2. Hook đánh dấu đã đọc
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: number) => {
            // Gọi API đánh dấu đã đọc
            const response = await api.put(`/api/notifications/${notificationId}/read`);
            return response.data;
        },
        onSuccess: () => {
            // 🔥 QUAN TRỌNG NHẤT: Dòng này báo cho toàn bộ ứng dụng (bao gồm cái chuông)
            // biết là dữ liệu đã thay đổi, hãy tải lại ngay!
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("Lỗi khi cập nhật trạng thái.");
        }
    });
}
// 3. Hook xóa thông báo (Cái bạn đang thiếu!)
export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (notificationId: number) => {
            await api.delete(`/api/notifications/${notificationId}`);
        },
        onSuccess: () => {
            toast.success("Đã xóa thông báo");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            toast.error("Lỗi khi xóa thông báo.");
        }
    });
}