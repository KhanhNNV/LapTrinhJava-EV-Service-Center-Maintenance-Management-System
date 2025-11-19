import { useState } from "react";
import { useConversations, useMessages, useSendMessage } from "@/services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, RefreshCw } from "lucide-react"; // Thêm icon RefreshCw
import { authService } from "@/services/auth";

export default function CustomerChat() {
    const currentUser = authService.getCurrentUser();
    const { data: conversations, isLoading } = useConversations();

    // 1. Logic tìm cuộc trò chuyện gần nhất (Sắp xếp giảm dần theo ID)
    const sortedConversations = conversations?.slice().sort((a, b) => b.conversationId - a.conversationId);
    const latestConversation = sortedConversations?.find(c => c.customerId === currentUser?.id);

    // 2. State kiểm soát chế độ "Tạo mới"
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [inputMessage, setInputMessage] = useState("");

    // 3. Xác định ID cuộc trò chuyện đang xem
    // Nếu đang tạo mới -> null. Nếu không -> Lấy ID cũ (nếu có)
    const activeConversationId = isCreatingNew ? null : latestConversation?.conversationId;

    // Lấy tin nhắn
    const { data: messages } = useMessages(activeConversationId || null);

    const sendMessageMutation = useSendMessage();

    const handleSend = () => {
        if (!inputMessage.trim()) return;

        sendMessageMutation.mutate({
            conversationId: activeConversationId,
            content: inputMessage
        });
        setInputMessage("");
        setIsCreatingNew(false); // Reset sau khi gửi xong (lúc này Backend đã tạo conv mới)
    };

    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            <Card className="flex-1 flex flex-col shadow-card">
                <CardHeader className="border-b py-4 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Hỗ trợ trực tuyến
                        {/* Hiển thị trạng thái nếu không phải đang tạo mới */}
                        {!isCreatingNew && latestConversation && (
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 
                                ${latestConversation.status === 'NEW' ? 'bg-green-100 text-green-700' :
                                latestConversation.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                                {latestConversation.status}
                            </span>
                        )}
                        {isCreatingNew && (
                            <span className="text-xs px-2 py-1 rounded-full ml-2 bg-green-100 text-green-700">
                                ĐANG TẠO MỚI
                            </span>
                        )}
                    </CardTitle>

                    {/* 4. NÚT TẠO MỚI / HỦY */}
                    {!isCreatingNew && latestConversation?.status === 'CLOSED' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsCreatingNew(true)}
                            className="ml-auto"
                        >
                            <RefreshCw className="w-4 h-4 mr-2"/>
                            Bắt đầu đoạn chat mới
                        </Button>
                    )}

                    {isCreatingNew && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsCreatingNew(false)}
                            className="ml-auto text-muted-foreground"
                        >
                            Hủy, xem lại tin nhắn cũ
                        </Button>
                    )}
                </CardHeader>

                {/* Khu vực hiển thị tin nhắn */}
                <CardContent className="flex-1 p-0 relative overflow-hidden bg-muted/10">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            {/* Nếu đang tạo mới -> Hiển thị màn hình chào mừng */}
                            {isCreatingNew ? (
                                <div className="flex flex-col items-center justify-center h-full text-center mt-20 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Đây là cuộc trò chuyện mới.</p>
                                    <p className="text-sm">Hãy gửi lời chào hoặc mô tả vấn đề của bạn!</p>
                                </div>
                            ) : (
                                // Logic hiển thị tin nhắn cũ
                                (!messages || messages.length === 0) ? (
                                    <div className="text-center text-muted-foreground mt-10">
                                        Chưa có tin nhắn nào.
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.senderId === currentUser?.id;
                                        return (
                                            <div key={msg.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${
                                                    isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none border"
                                                }`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                {/* Khu vực nhập tin nhắn */}
                <div className="p-4 border-t bg-background flex gap-2">
                    <Input
                        placeholder={isCreatingNew ? "Nhập nội dung yêu cầu mới..." : "Nhập tin nhắn..."}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        // Vô hiệu hóa ô nhập nếu Đã đóng VÀ Không bấm tạo mới
                        disabled={!isCreatingNew && latestConversation?.status === 'CLOSED'}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={sendMessageMutation.isPending || (!isCreatingNew && latestConversation?.status === 'CLOSED')}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}