import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth";
import { Wrench, Plus, CheckCircle, Loader2,Eye,Trash2,Check,ChevronsUpDown } from "lucide-react";
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
    ServiceItem
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


    useEffect(() => {
        if (currentUser?.id) {
            fetchTickets();
            fetchItems();
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

    // 2. Hoàn thành phiếu
    // const handleCompleteTicket = async (ticketId: number) => {
    //     if (!confirm("Bạn có chắc chắn muốn hoàn thành phiếu này?")) return;
    //
    //     try {
    //         await technicianTicketService.completeTicket(ticketId);
    //         toast({ title: "Thành công", description: "Phiếu dịch vụ đã hoàn thành", className: "bg-green-600 text-white" });
    //         refreshTickets();
    //     } catch (error) {
    //         toast({ title: "Lỗi", description: "Không thể hoàn thành phiếu", variant: "destructive" });
    //     }
    // };

    // 3. Xóa phiếu
    const handleDeleteTicket = async (ticketId: number) => {
        if (!confirm("Cảnh báo: Hành động này không thể hoàn tác. Bạn có chắc muốn xóa phiếu này?")) return;

        try {
            // Giả định service có hàm delete (bạn cần thêm vào service nếu chưa có)
            // await technicianTicketService.deleteTicket(ticketId);
            console.log("Deleting ticket", ticketId);
            toast({ title: "Thông báo", description: "API xóa chưa được cấu hình", variant: "default" });
            // refreshTickets();
        } catch (error) {
            toast({ title: "Lỗi", description: "Không thể xóa phiếu", variant: "destructive" });
        }
    };


    //
    // const handleAddPart = async () => {
    //     if (!selectedTicket || !newPart.partId) return;
    //
    //     try {
    //         await technicianTicketService.addPart(selectedTicket, parseInt(newPart.partId), newPart.quantity);
    //         toast({ title: "Success", description: "Part added successfully" });
    //
    //         // Reset form & Refresh data
    //         setNewPart({ partId: "", quantity: 1 });
    //         setIsPartDialogOpen(false);
    //         refreshTickets();
    //     } catch (error) {
    //         toast({ title: "Error", description: "Failed to add part", variant: "destructive" });
    //     }
    // };
    //
    // const handleAddServiceItem = async () => {
    //     if (!selectedTicket || !newServiceItem.itemId) return;
    //
    //     try {
    //         await technicianTicketService.addServiceItem(selectedTicket, parseInt(newServiceItem.itemId));
    //         toast({ title: "Success", description: "Service item added" });
    //
    //         // Reset form & Refresh data
    //         setNewServiceItem({ itemId: "" });
    //         setIsServiceDialogOpen(false);
    //         refreshTickets();
    //     } catch (error) {
    //         toast({ title: "Error", description: "Failed to add service item", variant: "destructive" });
    //     }
    // };
    //
    // const handleCompleteTicket = async (ticketId: number) => {
    //     try {
    //         await technicianTicketService.completeTicket(ticketId);
    //         toast({ title: "Success", description: "Service ticket completed" });
    //         refreshTickets();
    //     } catch (error) {
    //         toast({ title: "Error", description: "Failed to complete ticket", variant: "destructive" });
    //     }
    // };

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
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                                                            <TableHead className="text-right">Đơn giá</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedTicket.items.map((item: any, index: number) => {

                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell className="font-medium text-sm">{item.itemName}</TableCell>
                                                                    <TableCell className="text-right text-sm">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPriceAtTimeOfService)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </div>

                                        {/* --- CỘT PHẢI: LINH KIỆN (PARTS) --- */}
                                        <div className="space-y-3 border rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                                            <div className="flex items-center gap-2 font-semibold text-orange-600">
                                                <div className="w-4 h-4 border-2 border-orange-600 rounded-full" /> Linh kiện thay thế
                                            </div>

                                            {(!selectedTicket.parts || selectedTicket.parts.length === 0) ? (
                                                <p className="text-sm text-muted-foreground italic text-center py-4">Chưa có linh kiện nào.</p>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tên linh kiện</TableHead>
                                                            <TableHead className="text-center w-[50px]">SL</TableHead>
                                                            <TableHead className="text-right">Thành tiền</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {selectedTicket.parts.map((part: any, index: number) => {
                                                            // Xử lý mapping data
                                                            const name = part.name || part.part?.name || "N/A";
                                                            const quantity = part.quantity || 0;
                                                            const price = part.price || part.part?.price || 0;
                                                            const total = price * quantity;

                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell className="font-medium text-sm">{name}</TableCell>
                                                                    <TableCell className="text-center text-sm">{quantity}</TableCell>
                                                                    <TableCell className="text-right text-sm font-semibold">
                                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
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
                </div>
            )}
        </div>
    );
}