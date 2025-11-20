import api from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === KIỂU DỮ LIỆU (TYPES) ===
export interface Message {
    messageId: number;
    content: string;
    timestamp: string;
    senderId: number;
    senderName: string;
    isRead: boolean;
}

export interface Conversation {
    conversationId: number;
    status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
    topic: string;
    startTime: string;
    customerId: number;
    employeeId?: number;
}

// === API CALLS ===

// 1. Lấy danh sách cuộc trò chuyện
export const useConversations = () => {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: async () => {
            // Gọi API lấy tất cả cuộc trò chuyện
            const res = await api.get("/api/conversations");
            return res.data as Conversation[];
        }
    });
};

// 2. Lấy tin nhắn của một cuộc trò chuyện cụ thể
export const useMessages = (conversationId: number | null) => {
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            if (!conversationId) return [];
            const res = await api.get(`/api/messages/conversation/${conversationId}`);
            return res.data as Message[];
        },
        enabled: !!conversationId, // Chỉ gọi khi có ID
        refetchInterval: 3000, // Tự động tải lại tin nhắn mỗi 3 giây (Real-time đơn giản)
    });
};

// 3. Gửi tin nhắn (Tạo mới hoặc Chat tiếp)
export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, content }: { conversationId?: number, content: string }) => {
            // Nếu không có conversationId, Backend sẽ tự tạo cuộc hội thoại mới (như logic bạn đã làm)
            const res = await api.post("/api/messages", {
                conversationId,
                content
            });
            return res.data;
        },
        onSuccess: (_, variables) => {
            // Làm mới danh sách tin nhắn và danh sách cuộc trò chuyện
            queryClient.invalidateQueries({ queryKey: ["messages", variables.conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Không thể gửi tin nhắn");
        }
    });
};

// 4. (Staff) Nhận xử lý cuộc trò chuyện
export const useClaimConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conversationId: number) => {
            const res = await api.put(`/api/conversations/${conversationId}/claim`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Đã nhận xử lý cuộc trò chuyện!");
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi nhận cuộc trò chuyện");
        }
    });
};

// 5. (Staff) Đóng cuộc trò chuyện
export const useCloseConversation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (conversationId: number) => {
            const res = await api.put(`/api/conversations/${conversationId}/close`);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Đã đóng cuộc trò chuyện.");
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Lỗi khi đóng");
        }
    });
};