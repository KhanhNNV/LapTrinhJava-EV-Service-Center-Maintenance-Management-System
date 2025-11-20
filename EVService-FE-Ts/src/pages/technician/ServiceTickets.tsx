import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { Wrench, Plus, CheckCircle, Loader2,Eye,Trash2,Check,ChevronsUpDown,Sparkles,BrainCircuit,Info,Minus } from "lucide-react";
import { cn } from "@/utils/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
// Thêm import component UI cho Combobox
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// Import Service đã tách
import {
    technicianTicketService,
    ServiceTicket,
    Part,
    ServiceItem,
    AISuggestionResponse,
    AISuggestedPart
} from "@/services/serviceTicketService.ts";

export default function TechnicianServiceTickets() {
    const { toast } = useToast();
    const currentUser = authService.getCurrentUser();

    // State quản lý dữ liệu
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    //State xem chi tiết dịch vụ
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

    // State cho danh sách dịch vụ để chọn
    const [availableServiceItems, setAvailableServiceItems] = useState<ServiceItem[]>([]);

    // State cho Dialog thêm dịch vụ
    const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState<string>("");

    // State cho Combobox tìm kiếm dịch vụ
    const [openCombobox, setOpenCombobox] = useState(false);

    // --- STATE AI SUGGESTION  ---
    const [aiData, setAiData] = useState<AISuggestionResponse | null>(null);
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false); // Dialog chính (list parts)
    const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = useState(false); // Dialog phân tích chi tiết
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    //State lưu số lượng đang chỉnh sửa của từng Part trong bảng gợi ý
    const [suggestionQuantities, setSuggestionQuantities] = useState<Record<number, number>>({});

    // --- STATE CHO THÊM PHỤ TÙNG THỦ CÔNG ---
    const [availableParts, setAvailableParts] = useState<Part[]>([]); // Danh sách kho
    const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
    const [selectedPartId, setSelectedPartId] = useState<string>(""); // Lưu partId
    const [partQuantity, setPartQuantity] = useState<number>(1);      // Lưu số lượng nhập
    const [openPartCombobox, setOpenPartCombobox] = useState(false);  // Đóng mở dropdown



    useEffect(() => {
        if (currentUser?.id) {
            fetchTickets();
            fetchItems();
            fetchParts();
        }
    }, [currentUser?.id]);

    const fetchTickets = async () => {
        setIsLoading(true);
        try {
            const data= await technicianTicketService.getMyTickets(currentUser?.id);
            const sortData= data.sort((a,b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
            setTickets(sortData);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchItems = async () =>{
        setIsLoading(true);
        try {
            const items = await technicianTicketService.getAllServiceItems();
            setAvailableServiceItems(items);
        }catch (error){
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        }finally {
            setIsLoading(false);
        }
    }

    const fetchParts = async () => {
        try {
            const parts = await technicianTicketService.getAllParts();
            setAvailableParts(parts);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        }
    }

    // Hàm cập nhật lại list sau khi thêm
    const refreshTickets = async () => {
        try {
            const data = await technicianTicketService.getMyTickets(currentUser?.id);
            const sortData = data.sort((a, b) =>
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
            setTickets(sortData);

            // Nếu đang mở chi tiết ticket nào, cập nhật luôn data cho nó để UI hiển thị ngay
            if (selectedTicket) {
                const updatedTicket = sortData.find(t => t.ticketId === selectedTicket.ticketId);
                if (updatedTicket) {
                    setSelectedTicket(updatedTicket);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        }
    };

    const getStatusText = (status: string) => {
        const texts: any = {
            PENDING: "Chờ xác nhận",
            CONFIRMED: "Đã xác nhận",
            ASSIGNED: "Đã giao",
            IN_PROGRESS: "Đang tiến hành",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
        };
        return texts[status] || status;
    };

    const renderMarkdownText = (text: string | null | undefined) => {
        if (!text) return null;
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

    // 1. Xem chi tiết (Mở Dialog hoặc chuyển trang)
    const handleViewDetails = (ticket: ServiceTicket) => {
        setSelectedTicket(ticket);
    };

    const handleAddServiceItem = async () => {
        if (!selectedTicket || !selectedServiceId) return;

        try {
            await technicianTicketService.addServiceItem(
                selectedTicket.ticketId,
                parseInt(selectedServiceId)
            );

            toast({ title: "Thành công", description: "Đã thêm dịch vụ vào phiếu", className: "bg-green-600 text-white" });

            // Reset form và đóng dialog con
            setSelectedServiceId("");
            setIsAddServiceDialogOpen(false);

            // Refresh lại dữ liệu để thấy item mới
            refreshTickets();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể thêm dịch vụ", variant: "destructive" });
        }
    };

    const handleAddPart = async () => {
        if (!selectedTicket || !selectedPartId) return;

        // Validation cơ bản
        if (partQuantity <= 0) {
            toast({ title: "Lỗi", description: "Số lượng phải lớn hơn 0", variant: "destructive" });
            return;
        }

        try {
            await technicianTicketService.updatePart(
                selectedTicket.ticketId,
                parseInt(selectedPartId),
                partQuantity
            );

            toast({ title: "Thành công", description: "Đã thêm phụ tùng vào phiếu", className: "bg-green-600 text-white" });

            // Reset form
            setSelectedPartId("");
            setPartQuantity(1);
            setIsAddPartDialogOpen(false);

            // Refresh lại dữ liệu phiếu
            refreshTickets();
            // Tùy chọn: Refresh lại kho nếu muốn cập nhật số lượng tồn ngay lập tức
            fetchParts();
        } catch (error: any) {
            // Hiển thị lỗi từ Backend (ví dụ: Không đủ hàng)
            const errorMsg = error.response?.data?.message || "Không thể thêm phụ tùng";
            toast({ title: "Lỗi", description: errorMsg, variant: "destructive" });
        }
    };

    const handleOpenAISuggestion = async (serviceItemId: number, serviceName: string) => {
        setIsAIDialogOpen(true);
        setIsLoadingAI(true);
        setAiData(null);

        try {
            const data = await technicianTicketService.getAISuggestions(serviceItemId);
            setAiData(data);

            // Khởi tạo state số lượng dựa trên gợi ý của AI
            const initialQuantities: Record<number, number> = {};
            data.suggestions.forEach(s => {
                initialQuantities[s.partId] = s.suggestedQuantity;
            });
            setSuggestionQuantities(initialQuantities);

        } catch (error) {
            toast({ title: "Lỗi", description: "Không lấy được dữ liệu AI", variant: "destructive" });
            setIsAIDialogOpen(false);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleQuantityChange = (partId: number, newQuantity: string) => {
        const quantity = parseInt(newQuantity);
        if (!isNaN(quantity) && quantity >= 0) {
            setSuggestionQuantities(prev => ({
                ...prev,
                [partId]: quantity
            }));
        }
    };
    const handleAddSuggestedPart = async (part: AISuggestedPart) => {
        if (!selectedTicket) return;

        // Lấy số lượng người dùng đang nhập (hoặc mặc định là 1 nếu lỗi)
        const quantityToAdd = suggestionQuantities[part.partId] || 1;

        if (quantityToAdd <= 0) {
            toast({ title: "Lỗi", description: "Số lượng phải lớn hơn 0", variant: "destructive" });
            return;
        }

        try {
            await technicianTicketService.updatePart(
                selectedTicket.ticketId,
                part.partId,
                quantityToAdd // Dùng số lượng đã chỉnh sửa
            );

            toast({
                title: "Đã thêm phụ tùng",
                description: `Đã thêm ${quantityToAdd} x ${part.partName}`,
                className: "bg-blue-600 text-white"
            });

            refreshTickets();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể thêm phụ tùng", variant: "destructive" });
        }
    };

    const handleRemoveServiceItem = async (itemId: number, itemName: string) => {
        if (!selectedTicket) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${itemName}" không?`)) return;

        try {
            await technicianTicketService.removeServiceItem(selectedTicket.ticketId, itemId);
            toast({ title: "Đã xóa", description: `Đã xóa dịch vụ ${itemName}`, className: "bg-yellow-600 text-white" });
            refreshTickets(); // Load lại dữ liệu mới nhất
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa dịch vụ", variant: "destructive" });
        }
    };

    // Xử lý xóa phụ tùng
    const handleRemovePart = async (partId: number, partName: string) => {
        if (!selectedTicket) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa phụ tùng "${partName}" không?`)) return;

        try {
            await technicianTicketService.removePart(selectedTicket.ticketId, partId);
            toast({ title: "Đã xóa", description: `Đã xóa phụ tùng ${partName}`, className: "bg-yellow-600 text-white" });
            refreshTickets(); // Load lại dữ liệu mới nhất
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa phụ tùng", variant: "destructive" });
        }
    };

    // Hàm xử lý tăng/giảm số lượng
    const handleUpdatePartQuantity = async (partId: number, currentQuantity: number, change: number) => {
        if (!selectedTicket) return;
        const newQuantity = currentQuantity + change;

        // Chặn không cho giảm xuống dưới 1 (muốn xóa thì dùng nút thùng rác)
        if (newQuantity < 1) return;

        try {
            // Gọi API updatePart đã có trong service
            await technicianTicketService.updatePart(
                selectedTicket.ticketId,
                partId,
                newQuantity
            );

            // Refresh lại danh sách để cập nhật giao diện và tính lại tổng tiền
            refreshTickets();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể cập nhật số lượng", variant: "destructive" });
        }
    };



    // Format tiền tệ
    const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500",
        IN_PROGRESS: "bg-blue-500",
        COMPLETED: "bg-green-500",
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Phiếu dịch vụ</h2>
                <p className="text-muted-foreground">
                    Quản lý phiếu dịch vụ của bạn
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {tickets.length === 0 && (
                        <div className="text-center py-10 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">Không có phiếu dịch vụ nào.</p>
                        </div>
                    )}

                    {tickets.map((ticket) => (
                        <Card key={ticket.ticketId} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        #{ticket.ticketId} - {ticket.serviceType || "Dịch vụ không xác định"}
                                    </CardTitle>
                                    <Badge className={statusColors[ticket.status] || "bg-gray-500"}>
                                        {getStatusText(ticket.status)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Thời gian bắt đầu</p>
                                            <p className="font-medium">{new Date(ticket.startTime).toLocaleString()}</p>
                                        </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Thời gian kết thúc</p>
                                                {ticket.endTime && (
                                                    <p className="font-medium">{new Date(ticket.endTime).toLocaleString()}</p>
                                                )}
                                            </div>

                                        <div>
                                            <p className="text-sm text-muted-foreground">Tên khách hàng / Biển số xe</p>
                                            <p className="font-medium">
                                                {ticket.customerName} - <span className="font-mono bg-slate-100 px-1 rounded">{ticket.licensePlate}</span>
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tên nhân viên phân công</p>
                                            <p className="font-medium">{ticket.staffName}</p>
                                        </div>
                                        {ticket.noteCus && (
                                            <div className="col-span-full flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                <p className="font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                                                    Ghi chú của khách hàng:
                                                </p>
                                                <div className="max-h-[100px] w-full overflow-y-auto rounded border border-blue-200 bg-white p-2 dark:bg-black/20">
                                                    <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap break-all">
                                                        {ticket.noteCus}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {ticket.notes && (
                                            <div className="col-span-full flex flex-col gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
                                                <p className="font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                                                    Ghi chú của nhân viên:
                                                </p>
                                                <div className="max-h-[100px] w-full overflow-y-auto rounded border border-blue-200 bg-white p-2 dark:bg-black/20">
                                                    <p className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap break-all">
                                                        {ticket.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* --- KHU VỰC CÁC NÚT BẤM --- */}
                                    <div className="pt-4 mt-4 border-t flex flex-wrap gap-3 justify-end items-center">
                                        {/* 1. Nút Xem chi tiết */}
                                        <Button
                                            variant="outline"
                                            onClick={() => handleViewDetails(ticket)}
                                            className="flex-1 sm:flex-none"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Xem chi tiết dịch vụ
                                        </Button>

                                        {/* 2. Nút Hoàn thành (Chỉ hiện khi chưa hoàn thành/hủy) */}
                                        {ticket.status !== 'COMPLETED' && ticket.status !== 'CANCELLED' && (
                                            <Button
                                                variant="default"
                                                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                                                // onClick={() => handleCompleteTicket(ticket.ticketId)}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Hoàn thành phiếu
                                            </Button>
                                        )}

                                        {/* 3. Nút Xóa phiếu (Chỉ nên hiện khi trạng thái cho phép, VD: PENDING) */}
                                        {ticket.status !== 'COMPLETED' && (
                                            <Button
                                                variant="destructive"
                                                // onClick={() => handleDeleteTicket(ticket.ticketId)}
                                                className="flex-1 sm:flex-none"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Xóa phiếu
                                            </Button>
                                        )}
                                    </div>
                                    {/* --- KẾT THÚC KHU VỰC NÚT --- */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            {selectedTicket && (
                                <>
                                    <DialogHeader>
                                        <div className="flex items-center justify-between mr-8">
                                            <DialogTitle className="text-xl font-bold">
                                                Chi tiết phiếu #{selectedTicket.ticketId}
                                            </DialogTitle>
                                            <Badge className={statusColors[selectedTicket.status]}>
                                                {getStatusText(selectedTicket.status)}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            Khách hàng: {selectedTicket.customerName} | Biển số: {selectedTicket.licensePlate}
                                        </div>
                                    </DialogHeader>

                                    <div className="grid md:grid-cols-2 gap-6 py-4">
                                        {/* --- CỘT TRÁI: DỊCH VỤ (SERVICES) --- */}
                                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-2 font-semibold text-blue-600">
                                                <Wrench className="w-4 h-4" /> Dịch vụ sử dụng
                                            </div>
                                            {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && (
                                                <Button size="sm" variant="outline" onClick={() => setIsAddServiceDialogOpen(true)} className="h-7 text-xs">
                                                    <Plus className="w-3 h-3 mr-1" /> Thêm
                                                </Button>
                                            )}


                                            {(!selectedTicket.items || selectedTicket.items.length === 0) ? (
                                                <p className="text-sm text-muted-foreground italic text-center py-4">Chưa có dịch vụ nào.</p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tên dịch vụ</TableHead>
                                                            <TableHead className="text-center">Đơn giá</TableHead>
                                                            <TableHead className="text-right w-[100px]">Thao tác</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedTicket.items?.map((item: any, index: number) => (
                                                            <TableRow key={index} className="h-9">
                                                                <TableCell className="py-1 text-sm font-medium">{item.itemName || item.name}</TableCell>
                                                                <TableCell className="py-1 text-sm text-center">{formatMoney(item.unitPriceAtTimeOfService || item.price)}</TableCell>
                                                                <TableCell className="py-1 text-sm text-center">
                                                                    {/* --- NÚT GỢI Ý AI --- */}
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100"
                                                                        title="Xem gợi ý phụ tùng từ AI"
                                                                        // Cần truyền ID của Item (chứ không phải ID dòng trong ticket nếu có sự khác biệt)
                                                                        onClick={() => handleOpenAISuggestion(item.itemId || item.id, item.itemName || item.name)}
                                                                    >
                                                                        <Sparkles className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    {/* --- NÚT XÓA ITEM --- */}
                                                                    {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && (
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                                                                            title="Xóa dịch vụ này"
                                                                            onClick={() => handleRemoveServiceItem(item.itemId || item.id, item.itemName || item.name)}
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>

                                        {/* --- CỘT PHẢI: LINH KIỆN (PARTS) --- */}
                                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-2 font-semibold text-orange-600">
                                                <Wrench className="w-4 h-4" /> Phụ tùng thay thế
                                            </div>

                                            {/* NÚT THÊM PHỤ TÙNG */}
                                            {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && (
                                                <Button size="sm" variant="outline" onClick={() => setIsAddPartDialogOpen(true)} className="h-7 text-xs">
                                                    <Plus className="w-3 h-3 mr-1" /> Thêm
                                                </Button>
                                            )}

                                            {(!selectedTicket.parts || selectedTicket.parts.length === 0) ? (
                                                <p className="text-sm text-muted-foreground italic text-center py-4">Chưa có Phụ tùng nào.</p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tên phụ tùng</TableHead>
                                                            <TableHead className="text-center w-[110px]">Số lượng</TableHead>
                                                            <TableHead className="text-right">Thành tiền</TableHead>
                                                            <TableHead className="w-[40px]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedTicket.parts.map((part: any, index: number) => {
                                                            // Xử lý mapping data
                                                            const name = part.partName;
                                                            const quantity = part.quantity || 0;
                                                            const price = part.unitPriceAtTimeOfService;
                                                            const total = price * quantity;
                                                            const partIdToDelete = part.partId || part.id;
                                                            const partId = part.partId || part.id;

                                                            // Kiểm tra trạng thái để disable nút nếu phiếu đã đóng
                                                            const isReadOnly = selectedTicket.status === 'COMPLETED' || selectedTicket.status === 'CANCELLED';

                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell className="font-medium text-sm">{name}</TableCell>
                                                                    {/* --- CỘT SỐ LƯỢNG CÓ NÚT TĂNG GIẢM --- */}
                                                                    <TableCell className="text-center py-1">
                                                                        {isReadOnly ? (
                                                                            <span className="font-medium">{quantity}</span>
                                                                        ) : (
                                                                            <div className="flex items-center justify-center gap-1">
                                                                                {/* Nút Giảm (-) */}
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 p-0 hover:bg-slate-200"
                                                                                    onClick={() => handleUpdatePartQuantity(partId, quantity, -1)}
                                                                                    disabled={quantity <= 1} // Disable nếu sl = 1
                                                                                >
                                                                                    <Minus className="h-3 w-3" />
                                                                                </Button>

                                                                                {/* Số lượng hiện tại */}
                                                                                <span className="w-6 text-center text-sm font-medium tabular-nums">{quantity}</span>

                                                                                {/* Nút Tăng (+) */}
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 p-0 hover:bg-slate-200"
                                                                                    onClick={() => handleUpdatePartQuantity(partId, quantity, 1)}
                                                                                >
                                                                                    <Plus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-sm font-semibold">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                                                    </TableCell>
                                                                    <TableCell className="py-1 text-center">
                                                                        {/* --- NÚT XÓA PART --- */}
                                                                        {selectedTicket.status !== 'COMPLETED' && selectedTicket.status !== 'CANCELLED' && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-100"
                                                                                title="Xóa phụ tùng này"
                                                                                onClick={() => handleRemovePart(partIdToDelete, name)}
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                            </Button>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>
                                    </div>

                                </>
                            )}
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Thêm dịch vụ</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="service">Chọn dịch vụ</Label>
                                    <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openCombobox}
                                                className="w-full justify-between"
                                            >
                                                {selectedServiceId
                                                    ? (() => {
                                                        const item = availableServiceItems.find((item) => item.id.toString() === selectedServiceId);
                                                        return item
                                                            ? `${item.itemName} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}`
                                                            : "Dịch vụ không tồn tại";
                                                    })()
                                                    : "-- Tìm kiếm và chọn dịch vụ --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[380px] p-0 pointer-events-auto" align="start">
                                            <Command>
                                                {/* Ô INPUT TÌM KIẾM Ở ĐÂY */}
                                                <CommandInput placeholder="Nhập tên dịch vụ để tìm..." />

                                                <CommandList className="max-h-[200px] overflow-y-auto overscroll-contain">
                                                    <CommandEmpty>Không tìm thấy dịch vụ nào.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableServiceItems.map((item) => (
                                                            <CommandItem
                                                                key={item.id}
                                                                value={item.itemName} // Giá trị dùng để filter (tìm kiếm)
                                                                onSelect={(currentValue) => {
                                                                    setSelectedServiceId(item.id.toString());
                                                                    setOpenCombobox(false);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedServiceId === item.id.toString() ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-1 items-center justify-between gap-2"
                                                                     title={item.description || "Không có mô tả"}>
                                                                    <span className="font-medium">{item.itemName}</span>
                                                                    <span className="text-muted-foreground font-mono text-xs whitespace-nowrap">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleAddServiceItem} disabled={!selectedServiceId}>Xác nhận thêm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* --- DIALOG THÊM PHỤ TÙNG THỦ CÔNG --- */}
                    <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Thêm phụ tùng từ kho</DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-4 py-2">
                                {/* 1. COMBOBOX CHỌN PHỤ TÙNG */}
                                <div className="grid gap-2">
                                    <Label>Chọn phụ tùng</Label>
                                    <Popover open={openPartCombobox} onOpenChange={setOpenPartCombobox} modal={true}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openPartCombobox}
                                                className="w-full justify-between"
                                            >
                                                {selectedPartId
                                                    ? (() => {
                                                        const part = availableParts.find((p) => p.partId.toString() === selectedPartId);
                                                        return part
                                                            ? <span className="truncate block w-[280px] text-left">
                                            {part.name}
                                          </span>
                                                            : "Phụ tùng không tồn tại";
                                                    })()
                                                    : "-- Tìm kiếm phụ tùng --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>

                                        <PopoverContent className="w-[380px] p-0" align="start">
                                            <Command className="overflow-hidden">
                                                <CommandInput placeholder="Nhập tên phụ tùng..." />
                                                <CommandList className="max-h-[200px] overflow-y-auto overscroll-contain">
                                                    <CommandEmpty>Không tìm thấy trong kho.</CommandEmpty>
                                                    <CommandGroup>
                                                        {availableParts.map((part) => (
                                                            <CommandItem
                                                                key={part.partId}
                                                                value={part.name}
                                                                onSelect={() => {
                                                                    setSelectedPartId(part.partId.toString());
                                                                    setOpenPartCombobox(false);
                                                                }}
                                                                className="cursor-pointer py-1 text-sm h-9"
                                                                disabled={part.quantityInStock <= 0} // Disable nếu hết hàng
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedPartId === part.partId.toString() ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-1 items-center justify-between gap-2 overflow-hidden">
                                                <span className={cn("font-medium truncate", part.quantityInStock <= 0 && "text-muted-foreground line-through")}>
                                                    {part.name}
                                                </span>

                                                                    <div className="flex items-center gap-2">
                                                                        {/* Badge hiển thị tồn kho */}
                                                                        <Badge
                                                                            variant={part.quantityInStock > 0 ? "outline" : "destructive"}
                                                                            className="text-[10px] px-1 h-5 border-slate-300"
                                                                        >
                                                                            Kho: {part.quantityInStock}
                                                                        </Badge>
                                                                        <span className="text-muted-foreground font-mono text-xs whitespace-nowrap">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(part.price)}
                                                    </span>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* 2. Ô NHẬP SỐ LƯỢNG */}
                                <div className="grid gap-2">
                                    <div className="flex justify-between">
                                        <Label>Số lượng</Label>
                                        {selectedPartId && (
                                            <span className="text-xs text-muted-foreground">
                            {/* Hiển thị lại tồn kho ở đây cho tiện theo dõi */}
                                                Tối đa: {availableParts.find(p => p.partId.toString() === selectedPartId)?.quantityInStock}</span>
                                        )}
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        // Max theo tồn kho (tùy chọn, backend đã check rồi nhưng chặn ở FE cho tốt UX)
                                        max={availableParts.find(p => p.partId.toString() === selectedPartId)?.quantityInStock}
                                        value={partQuantity}
                                        onChange={(e) => setPartQuantity(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddPartDialogOpen(false)}>Hủy</Button>
                                <Button onClick={handleAddPart} disabled={!selectedPartId || partQuantity <= 0}>Xác nhận thêm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* ====================================================================== */}
                    {/* --- DIALOG GỢI Ý AI (DANH SÁCH PART) --- */}
                    {/* ====================================================================== */}
                    <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                        <DialogContent className="sm:max-w-[650px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-indigo-700">
                                    <Sparkles className="w-5 h-5" />
                                    Gợi ý phụ tùng thông minh
                                </DialogTitle>
                                <DialogDescription>
                                    Dựa trên dịch vụ: <span className="font-semibold text-foreground">{aiData?.serviceItemName || "..."}</span>
                                </DialogDescription>
                            </DialogHeader>

                            {isLoadingAI ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 min-h-[300px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin w-14 h-14"></div>
                                        <div className="flex items-center justify-center w-14 h-14 rounded-full">
                                            <BrainCircuit className="w-6 h-6 text-indigo-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-base font-medium text-indigo-600 animate-pulse">
                                        AI đang phân tích dữ liệu...
                                    </p>
                                </div>
                            ) : aiData ? (
                                <div className="space-y-4">
                                    <div className="border rounded-md overflow-hidden max-h-[400px] overflow-y-auto">
                                        <Table>
                                            <TableHeader className="bg-indigo-50 sticky top-0 z-10">
                                                <TableRow>
                                                    <TableHead>Tên phụ tùng</TableHead>
                                                    <TableHead className="text-center w-[100px]">Số lượng</TableHead>
                                                    <TableHead className="text-right">Hành động</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {aiData.suggestions.map((part) => (
                                                    <TableRow key={part.partId}>
                                                        <TableCell className="font-medium">
                                                            {part.partName}
                                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                                <Info className="w-3 h-3" />
                                                                Độ tin cậy: {(part.confidenceScore * 100).toFixed(0)}%
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center p-2">
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                className="h-8 w-20 text-center mx-auto border-indigo-200 focus-visible:ring-indigo-500"
                                                                value={suggestionQuantities[part.partId] ?? part.suggestedQuantity}
                                                                onChange={(e) => handleQuantityChange(part.partId, e.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                size="sm"
                                                                className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                onClick={() => handleAddSuggestedPart(part)}
                                                            >
                                                                <Plus className="w-3 h-3 mr-1" /> Thêm
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        {aiData.suggestions.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <BrainCircuit className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                                                <p>AI không tìm thấy gợi ý phù hợp cho dịch vụ này.</p>
                                            </div>
                                        )}
                                    </div>

                                    <DialogFooter className="sm:justify-between items-center gap-2 border-t pt-4">
                                        <Button
                                            variant="outline"
                                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                            onClick={() => setIsAnalysisDialogOpen(true)}
                                        >
                                            <BrainCircuit className="w-4 h-4 mr-2" />
                                            Xem chi tiết phân tích
                                        </Button>
                                        <Button variant="secondary" onClick={() => setIsAIDialogOpen(false)}>
                                            Đóng
                                        </Button>
                                    </DialogFooter>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-red-500">
                                    Không có dữ liệu hoặc lỗi kết nối.
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* ====================================================================== */}
                    {/* --- DIALOG CHI TIẾT PHÂN TÍCH AI --- */}
                    {/* ====================================================================== */}
                    <Dialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
                        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                                    Chi tiết phân tích AI
                                </DialogTitle>
                                <DialogDescription>
                                    Dữ liệu phân tích trong {aiData?.analysisPeriod} cho dịch vụ "{aiData?.serviceItemName}"
                                </DialogDescription>
                            </DialogHeader>

                            {aiData && (
                                <div className="space-y-6 py-2">
                                    {/* Thống kê chung */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <Card>
                                            <CardContent className="p-4 pt-4 text-center">
                                                <div className="text-2xl font-bold text-indigo-600">{aiData.totalSuggestions}</div>
                                                <div className="text-xs text-muted-foreground">Gợi ý được tạo</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 pt-4 text-center">
                                                <div className="text-2xl font-bold text-green-600">{(aiData.overallConfidenceScore * 100).toFixed(0)}%</div>
                                                <div className="text-xs text-muted-foreground">Độ tin cậy TB</div>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardContent className="p-4 pt-4 text-center">
                                                <div className="text-sm font-bold text-orange-600 truncate" title={formatMoney(aiData.totalEstimatedCost)}>
                                                    {new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short", style: 'currency', currency: 'VND' }).format(aiData.totalEstimatedCost)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Ước tính chi phí</div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-3 items-start">
                                        <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                                        <div className="space-y-1 w-full">
                                            <h4 className="text-sm font-semibold text-indigo-900">
                                                Tổng quan từ AI
                                            </h4>
                                            {/* Sử dụng whitespace-pre-wrap để giữ xuống dòng nếu có */}
                                            <div className="text-sm text-indigo-800 leading-relaxed whitespace-pre-wrap">
                                                {aiData.aiReasoning ? renderMarkdownText(aiData.aiReasoning) : "Không có dữ liệu phân tích."}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chi tiết từng Suggestion */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold border-b pb-2">Giải thích chi tiết từng phụ tùng</h4>
                                        {aiData.suggestions.map((part, idx) => (
                                            <div key={idx} className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-bold text-sm">{part.partName}</h5>
                                                        <Badge variant="outline" className="mt-1 text-[10px] uppercase border-indigo-200 text-indigo-700 bg-indigo-50">
                                                            Mức độ: {part.importanceLevel}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-mono text-muted-foreground">{formatMoney(part.currentUnitPrice)}/cái</span>
                                                    </div>
                                                </div>

                                                <div className="bg-white dark:bg-black border rounded p-3 text-sm space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                        <p><span className="font-semibold">Lý do:</span> {part.reasoning}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                                                        <div>• Đã dùng {part.historicalUsageCount} lần trong quá khứ</div>
                                                        <div>• Tổng lượng dùng: {part.historicalTotalQuantity}</div>
                                                        <div>• Tỉ lệ sử dụng: {(part.usageRate * 100).toFixed(1)}%</div>
                                                        <div>• SL trung bình mỗi lần: {part.historicalAverageQuantity}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-xs text-muted-foreground text-center pt-4">
                                        Dữ liệu được tạo lúc: {new Date(aiData.generatedDate).toLocaleString('vi-VN')}
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button onClick={() => setIsAnalysisDialogOpen(false)}>Đóng</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>
    );
}