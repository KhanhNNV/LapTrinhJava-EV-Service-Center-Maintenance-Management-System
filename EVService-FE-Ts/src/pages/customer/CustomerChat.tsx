import { useState, useEffect } from "react";
import { useConversations, useMessages, useSendMessage } from "@/services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { authService } from "@/services/auth";

export default function CustomerChat() {
    const currentUser = authService.getCurrentUser();

    // 1. Lấy danh sách hội thoại
    const { data: conversations, isLoading } = useConversations();

    // 2. Tìm cuộc trò chuyện duy nhất của khách hàng này
    // (Backend logic đảm bảo mỗi khách chỉ có 1 active, hoặc ta lấy cái mới nhất)
    const myConversation = conversations
        ?.filter(c => c.customerId === currentUser?.id)
        .sort((a, b) => b.conversationId - a.conversationId)[0];

    // State cho ô nhập tin nhắn
    const [inputMessage, setInputMessage] = useState("");

    // 3. Lấy tin nhắn (Nếu chưa có cuộc hội thoại nào -> null -> trả về rỗng)
    const { data: messages } = useMessages(myConversation?.conversationId || null);

    const sendMessageMutation = useSendMessage();

    const handleSend = () => {
        if (!inputMessage.trim()) return;

        sendMessageMutation.mutate({
            conversationId: myConversation?.conversationId, // Gửi vào ID cũ (nếu có)
            content: inputMessage
        });
        setInputMessage("");
    };

    if (isLoading) return <div>Đang tải...</div>;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
            <Card className="flex-1 flex flex-col shadow-card">
                <CardHeader className="border-b py-4">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Hỗ trợ trực tuyến

                        {/* Hiển thị trạng thái hiện tại */}
                        {myConversation && (
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 
                                ${myConversation.status === 'NEW' ? 'bg-green-100 text-green-700' :
                                myConversation.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                                {myConversation.status === 'CLOSED' ? 'ĐÃ ĐÓNG (Nhắn tin để mở lại)' : myConversation.status}
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>

                {/* Khu vực hiển thị tin nhắn */}
                <CardContent className="flex-1 p-0 relative overflow-hidden bg-muted/10">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-4">
                            {(!messages || messages.length === 0) ? (
                                <div className="flex flex-col items-center justify-center h-full text-center mt-20 text-muted-foreground">
                                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Chào bạn, chúng tôi có thể giúp gì?</p>
                                    <p className="text-sm">Hãy gửi tin nhắn để bắt đầu.</p>
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
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>

                {/* Khu vực nhập tin nhắn */}
                <div className="p-4 border-t bg-background flex gap-2">
                    <Input
                        placeholder="Nhập tin nhắn..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        // Không bao giờ khóa ô nhập (trừ khi đang gửi)
                        disabled={sendMessageMutation.isPending}
                    />
                    <Button size="icon" onClick={handleSend} disabled={sendMessageMutation.isPending}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}