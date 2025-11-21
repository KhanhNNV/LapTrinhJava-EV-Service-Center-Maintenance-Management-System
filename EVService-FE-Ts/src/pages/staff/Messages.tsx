import { useState } from "react";
import {
    useConversations,
    useMessages,
    useSendMessage,
    useClaimConversation,
    useCloseConversation
} from "@/services/chatService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, CheckCircle, XCircle, User } from "lucide-react";
import { authService } from "@/services/auth";
import { toast } from "sonner";

export default function StaffMessages() {
    const currentUser = authService.getCurrentUser();

    // 1. Lấy danh sách tất cả cuộc trò chuyện
    const { data: conversations, isLoading } = useConversations();

    // State: Cuộc trò chuyện đang được chọn để xem
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [inputMessage, setInputMessage] = useState("");

    // 2. Lấy tin nhắn của cuộc trò chuyện đang chọn
    const { data: messages } = useMessages(selectedConversationId);

    // Các hành động
    const sendMessageMutation = useSendMessage();
    const claimMutation = useClaimConversation();
    const closeMutation = useCloseConversation();

    // Lọc danh sách: Chia thành "Chưa xử lý" (NEW) và "Của tôi"
    const newConversations = conversations?.filter(c => c.status === 'NEW') || [];
    const myConversations = conversations?.filter(c => c.employeeId === currentUser?.id && c.status === 'IN_PROGRESS') || [];
    const closedConversations = conversations?.filter(c => c.status === 'CLOSED') || [];

    // Xử lý gửi tin nhắn
    const handleSend = () => {
        if (!inputMessage.trim() || !selectedConversationId) return;
        sendMessageMutation.mutate({
            conversationId: selectedConversationId,
            content: inputMessage
        });
        setInputMessage("");
    };

    // Tìm thông tin cuộc hội thoại đang chọn
    const activeConv = conversations?.find(c => c.conversationId === selectedConversationId);

    if (isLoading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className="h-[calc(100vh-100px)] grid grid-cols-12 gap-6">

            {/* CỘT TRÁI: DANH SÁCH CUỘC TRÒ CHUYỆN */}
            <Card className="col-span-4 flex flex-col shadow-card">
                <CardHeader className="border-b py-4">
                    <CardTitle className="text-lg">Hộp thư hỗ trợ</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-6">

                        {/* Mục 1: Yêu cầu Mới (Cần Claim) */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"/>
                                Yêu cầu mới ({newConversations.length})
                            </h3>
                            <div className="space-y-2">
                                {newConversations.map(c => (
                                    <div
                                        key={c.conversationId}
                                        onClick={() => setSelectedConversationId(c.conversationId)}
                                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${selectedConversationId === c.conversationId ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-sm">Khách #{c.customerId}</span>
                                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">MỚI</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{c.topic}</p>
                                    </div>
                                ))}
                                {newConversations.length === 0 && <p className="text-xs text-muted-foreground italic">Không có yêu cầu mới</p>}
                            </div>
                        </div>

                        {/* Mục 2: Đang xử lý (Của tôi) */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"/>
                                Đang xử lý ({myConversations.length})
                            </h3>
                            <div className="space-y-2">
                                {myConversations.map(c => (
                                    <div
                                        key={c.conversationId}
                                        onClick={() => setSelectedConversationId(c.conversationId)}
                                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors ${selectedConversationId === c.conversationId ? "border-primary bg-primary/5" : ""}`}
                                    >
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium text-sm">Khách #{c.customerId}</span>
                                            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">ĐANG CHAT</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{c.topic}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mục 3: Đã đóng (Lịch sử) */}
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground mb-2">Đã đóng</h3>
                            <div className="space-y-2 opacity-60">
                                {closedConversations.map(c => (
                                    <div
                                        key={c.conversationId}
                                        onClick={() => setSelectedConversationId(c.conversationId)}
                                        className={`p-3 rounded-lg border cursor-pointer hover:bg-muted ${selectedConversationId === c.conversationId ? "border-primary" : ""}`}
                                    >
                                        <p className="text-sm font-medium">Khách #{c.customerId}</p>
                                        <p className="text-xs text-muted-foreground truncate">{c.topic}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </ScrollArea>
            </Card>

            {/* CỘT PHẢI: CỬA SỔ CHAT */}
            <Card className="col-span-8 flex flex-col shadow-card">
                {selectedConversationId ? (
                    <>
                        {/* Header của khung chat */}
                        <CardHeader className="border-b py-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Khách hàng #{activeConv?.customerId}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">{activeConv?.topic}</p>
                            </div>

                            {/* CÁC NÚT HÀNH ĐỘNG */}
                            <div className="flex gap-2">
                                {/* Nút Nhận việc: Chỉ hiện khi trạng thái là NEW */}
                                {activeConv?.status === 'NEW' && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => claimMutation.mutate(selectedConversationId)}
                                        disabled={claimMutation.isPending}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Nhận xử lý
                                    </Button>
                                )}

                                {/* Nút Kết thúc: Chỉ hiện khi đang xử lý và là của mình */}
                                {activeConv?.status === 'IN_PROGRESS' && activeConv?.employeeId === currentUser?.id && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            if(confirm("Bạn có chắc muốn đóng cuộc trò chuyện này?")) {
                                                closeMutation.mutate(selectedConversationId);
                                            }
                                        }}
                                        disabled={closeMutation.isPending}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Kết thúc tư vấn
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        {/* Nội dung tin nhắn */}
                        <CardContent className="flex-1 p-0 relative overflow-hidden bg-muted/10">
                            <ScrollArea className="h-full p-4">
                                <div className="space-y-4">
                                    {messages?.map((msg) => {
                                        const isMe = msg.senderId === currentUser?.id; // Tin nhắn của Staff
                                        return (
                                            <div key={msg.messageId} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                <div className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${
                                                    isMe ? "bg-primary text-white rounded-tr-none" : "bg-white text-foreground rounded-tl-none border"
                                                }`}>
                                                    <p>{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 opacity-70 ${isMe ? "text-right" : "text-left"}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - {msg.senderName}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>

                        {/* Ô nhập tin nhắn: Chỉ hiện khi được phép chat */}
                        <div className="p-4 border-t bg-background">
                            {activeConv?.status === 'IN_PROGRESS' && activeConv?.employeeId === currentUser?.id ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nhập câu trả lời..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    />
                                    <Button size="icon" onClick={handleSend} disabled={sendMessageMutation.isPending}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-muted-foreground bg-muted p-2 rounded">
                                    {activeConv?.status === 'NEW' ? "Bạn cần nhận xử lý để trả lời." : "Cuộc trò chuyện này đã đóng hoặc do người khác phụ trách."}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
                    </div>
                )}
            </Card>
        </div>
    );
}