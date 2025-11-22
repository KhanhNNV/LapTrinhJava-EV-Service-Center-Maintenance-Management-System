import { useState, useMemo } from "react";
import { useConversations, useMessages } from "@/services/chatService"; // Sử dụng lại hook đã có
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Search,
    User,
    MessageSquare,
    ShieldAlert,
    Clock,
    Filter,
    UserCog
} from "lucide-react";

export default function AdminChatMonitor() {
    // 1. Lấy toàn bộ dữ liệu cuộc trò chuyện từ API
    const { data: conversations, isLoading } = useConversations();

    // State quản lý giao diện
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | NEW | IN_PROGRESS | CLOSED

    // 2. Lấy tin nhắn chi tiết (Real-time polling)
    const { data: messages, isLoading: isLoadingMessages } = useMessages(selectedConversationId);

    // 3. Logic Lọc & Tìm kiếm (Client-side filtering)
    const filteredConversations = useMemo(() => {
        if (!conversations) return [];

        return conversations.filter((c) => {
            // Lọc theo Tab trạng thái
            const matchStatus = statusFilter === "ALL" ? true : c.status === statusFilter;

            // Lọc theo từ khóa (tìm ID khách, topic, hoặc ID nhân viên)
            const searchLower = searchTerm.toLowerCase();
            const matchSearch =
                c.topic.toLowerCase().includes(searchLower) ||
                c.customerId.toString().includes(searchLower) ||
                (c.employeeId && c.employeeId.toString().includes(searchLower));

            return matchStatus && matchSearch;
        });
    }, [conversations, statusFilter, searchTerm]);

    // Lấy thông tin chi tiết cuộc hội thoại đang chọn
    const activeConv = conversations?.find(c => c.conversationId === selectedConversationId);

    // Helper: Render badge trạng thái đẹp hơn cho Admin
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">Mới</Badge>;
            case 'IN_PROGRESS':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-normal">Đang xử lý</Badge>;
            case 'CLOSED':
                return <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 font-normal">Đã đóng</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground">Đang tải dữ liệu hệ thống...</p>
            </div>
        </div>
    );

    return (
        <div className="h-[calc(100vh-60px)] grid grid-cols-12 gap-0 bg-white">

            {/* --- CỘT TRÁI: DANH SÁCH & BỘ LỌC (4 phần) --- */}
            <div className="col-span-4 flex flex-col border-r bg-gray-50/50">
                {/* Header Bộ lọc */}
                <div className="p-4 border-b bg-white space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-600"/>
                            Giám sát hỗ trợ
                        </h2>
                        <p className="text-xs text-muted-foreground">Xem toàn bộ lịch sử chat Staff - Khách hàng</p>
                    </div>

                    {/* Thanh tìm kiếm */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm ID khách, topic, ID nhân viên..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Tabs Lọc Trạng Thái */}
                    <Tabs defaultValue="ALL" onValueChange={setStatusFilter} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 h-9">
                            <TabsTrigger value="ALL" className="text-xs">Tất cả</TabsTrigger>
                            <TabsTrigger value="NEW" className="text-xs">Mới</TabsTrigger>
                            <TabsTrigger value="IN_PROGRESS" className="text-xs">Đang chat</TabsTrigger>
                            <TabsTrigger value="CLOSED" className="text-xs">Đã xong</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Danh sách cuộc hội thoại */}
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredConversations.length > 0 ? (
                            filteredConversations.map((c) => (
                                <button
                                    key={c.conversationId}
                                    onClick={() => setSelectedConversationId(c.conversationId)}
                                    className={`flex flex-col gap-2 p-4 text-left border-b transition-colors hover:bg-gray-100 focus:outline-none
                                        ${selectedConversationId === c.conversationId ? "bg-blue-50/60 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"}`}
                                >
                                    <div className="flex w-full flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 font-medium text-sm text-gray-900">
                                                <User className="h-3.5 w-3.5 text-gray-500" />
                                                Khách hàng #{c.customerId}
                                            </div>
                                            {renderStatusBadge(c.status)}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate font-medium pl-5">
                                            {c.topic}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-gray-400 pl-5 pt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(c.startTime).toLocaleDateString('vi-VN')}
                                        </span>

                                        {/* Hiển thị ai đang phụ trách */}
                                        {c.employeeId ? (
                                            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                                <UserCog className="w-3 h-3" />
                                                Staff #{c.employeeId}
                                            </span>
                                        ) : (
                                            <span className="text-orange-500 italic">Chưa assign</span>
                                        )}
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                <Filter className="w-8 h-8 opacity-20"/>
                                <p className="text-sm">Không tìm thấy kết quả nào.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t bg-white text-[10px] text-center text-muted-foreground">
                    Tổng: {filteredConversations.length} cuộc hội thoại
                </div>
            </div>

            {/* --- CỘT PHẢI: CHI TIẾT & LỊCH SỬ CHAT (8 phần) --- */}
            <div className="col-span-8 flex flex-col bg-white h-full overflow-hidden relative">
                {selectedConversationId && activeConv ? (
                    <>
                        {/* Header Chat Admin View */}
                        <div className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarFallback className="bg-gray-100 text-gray-600 font-bold">
                                        K{activeConv.customerId}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">
                                        Khách hàng #{activeConv.customerId}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        Chủ đề: <span className="font-medium text-gray-700">{activeConv.topic}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Thông tin người phụ trách bên phải */}
                            <div className="text-right bg-gray-50 px-3 py-1.5 rounded-md border">
                                <div className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-0.5">Phụ trách bởi</div>
                                <div className="font-medium text-sm text-blue-700 flex items-center justify-end gap-1">
                                    {activeConv.employeeId ? (
                                        <>
                                            <UserCog className="w-3.5 h-3.5" />
                                            Nhân viên #{activeConv.employeeId}
                                        </>
                                    ) : (
                                        <span className="text-orange-600">Chưa có nhân viên</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nội dung Messages */}
                        <CardContent className="flex-1 p-0 bg-slate-50 relative overflow-hidden">
                            <ScrollArea className="h-full p-6">
                                {isLoadingMessages ? (
                                    <div className="flex justify-center items-center h-20 text-sm text-muted-foreground gap-2">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        Đang tải lịch sử...
                                    </div>
                                ) : (
                                    <div className="space-y-6 pb-4">
                                        {/* Thông báo ngày bắt đầu */}
                                        <div className="flex justify-center">
                                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                                                Bắt đầu: {new Date(activeConv.startTime).toLocaleString('vi-VN')}
                                            </span>
                                        </div>

                                        {messages?.length === 0 && (
                                            <div className="text-center text-sm text-gray-400 italic mt-10">
                                                Chưa có tin nhắn nào được ghi nhận.
                                            </div>
                                        )}

                                        {messages?.map((msg) => {
                                            // Logic hiển thị:
                                            // Nếu sender trùng với customerId của cuộc hội thoại -> Là Khách (Trái)
                                            // Nếu khác -> Là Staff (Phải)
                                            const isCustomer = msg.senderId === activeConv.customerId;

                                            return (
                                                <div key={msg.messageId} className={`flex w-full ${isCustomer ? "justify-start" : "justify-end"}`}>
                                                    <div className={`flex max-w-[75%] ${isCustomer ? "flex-row" : "flex-row-reverse"} gap-2`}>


                                                        {/* Bong bóng chat */}
                                                        <div className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}>
                                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                                                isCustomer
                                                                    ? "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                                                    : "bg-blue-600 text-white rounded-tr-none"
                                                            }`}>
                                                                {msg.content}
                                                            </div>

                                                            {/* Metadata tin nhắn */}
                                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {msg.senderName}
                                                                </span>
                                                                <span className="text-[10px] text-gray-300">•</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>

                        {/* Footer Monitor Mode */}
                        <div className="p-4 border-t bg-amber-50/50 backdrop-blur-sm">
                            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm">
                                <ShieldAlert className="w-4 h-4"/>
                                <span className="font-medium">Chế độ giám sát (Read-only)</span>
                                <span className="text-amber-600/70 text-xs hidden sm:inline">- Bạn đang xem cuộc trò chuyện với tư cách Quản trị viên.</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-slate-50/50">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                            <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700">Chưa chọn cuộc hội thoại</h3>
                        <p className="text-sm text-gray-500 max-w-xs text-center mt-2">
                            Chọn một cuộc hội thoại từ danh sách bên trái để xem chi tiết lịch sử và quá trình hỗ trợ.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}