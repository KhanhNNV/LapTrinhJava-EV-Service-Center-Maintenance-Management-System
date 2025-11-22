import { useState, useMemo } from 'react';
import { useAllInvoices, InvoiceDto, useConfirmCashPayment } from '@/services/customerInvoices'; // Import hook mới
import { usePagination } from "@/hooks/usePagination";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from "@/components/ui/separator";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

// Icons
// Thêm icon Banknote, CheckCircle
import { Search, Filter, Eye, Loader2, FileText, User, Phone, Wrench, Banknote, CheckCircle } from 'lucide-react';
import { PaginationControls } from "@/components/common/PaginationControls";
import { toast } from "sonner"; // Import toast để confirm

export default function InvoicesManagement() {
    // 1. Hooks
    const { data: invoices, isLoading, isError } = useAllInvoices();
    const { mutate: confirmPayment, isPending: isConfirming } = useConfirmCashPayment(); // Hook xác nhận

    // 2. State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);

    // 3. Logic Filter & Sort (Giữ nguyên)
    const filteredInvoices = useMemo(() => {
        if (!invoices) return [];
        return invoices
            .filter((inv) => {
                const searchLower = searchTerm.toLowerCase();
                const matchSearch =
                    inv.customerName.toLowerCase().includes(searchLower) ||
                    inv.customerPhone.includes(searchLower) ||
                    inv.id.toString().includes(searchLower);
                const matchStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
                return matchSearch && matchStatus;
            })
            .sort((a, b) => new Date(b.completedTime).getTime() - new Date(a.completedTime).getTime());
    }, [invoices, searchTerm, statusFilter]);

    // 4. Pagination (Giữ nguyên)
    const {
        currentData, currentPage, totalPages, goToPage, totalItems, indexOfFirstItem, indexOfLastItem
    } = usePagination(filteredInvoices, 10);

    // --- Helper Functions (Giữ nguyên) ---
    const formatCurrency = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Đã thanh toán</Badge>;
            case 'PENDING': return <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200">Chờ thanh toán</Badge>;
            case 'FAILED': return <Badge variant="destructive">Thất bại</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    // --- Action Handler: Xác nhận thanh toán ---
    const handleConfirmCash = (invoiceId: number) => {
        // Dùng window.confirm hoặc Custom Dialog để chắc chắn
        if (window.confirm(`Xác nhận đã thu tiền mặt cho hóa đơn #${invoiceId}?`)) {
            confirmPayment(invoiceId, {
                onSuccess: () => {
                    // Đóng modal nếu đang mở
                    if (selectedInvoice?.id === invoiceId) {
                        setSelectedInvoice(null);
                    }
                }
            });
        }
    };

    // --- Render UI ---
    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (isError) return <div className="p-8 text-center text-red-500">Không thể tải dữ liệu.</div>;

    return (
        <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
            {/* ... Header & Toolbar giữ nguyên ... */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý Hóa đơn</h1>
                    <p className="text-muted-foreground">Theo dõi doanh thu và xác nhận thanh toán.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-4 py-1">Tổng: {totalItems}</Badge>
                </div>
            </div>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm tên, SĐT hoặc mã HĐ..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                                <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <CardHeader className="px-6 py-4 border-b bg-white">
                    <CardTitle className="text-base font-medium">Danh sách hóa đơn</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[80px]">Mã #</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Thời gian hoàn thành</TableHead>
                                <TableHead>Kỹ thuật viên</TableHead>
                                <TableHead className="text-right">Tổng tiền</TableHead>
                                <TableHead className="text-center">Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">Không có dữ liệu</TableCell></TableRow>
                            ) : (
                                currentData.map((invoice) => (
                                    <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="font-medium">#{invoice.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{invoice.customerName}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> {invoice.customerPhone}</div>
                                        </TableCell>
                                        <TableCell><div className="text-sm">{formatDateTime(invoice.completedTime)}</div></TableCell>
                                        <TableCell><div className="text-sm">{invoice.technicianName}</div></TableCell>
                                        <TableCell className="text-right font-bold text-gray-900">{formatCurrency(invoice.grandTotal)}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(invoice.paymentStatus || 'PENDING')}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Nút xác nhận nhanh trên bảng */}
                                                {invoice.paymentStatus === 'PENDING' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 hover:bg-green-50 border-green-200"
                                                        title="Xác nhận đã thu tiền"
                                                        onClick={(e) => { e.stopPropagation(); handleConfirmCash(invoice.id); }}
                                                        disabled={isConfirming}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50" onClick={() => setSelectedInvoice(invoice)}>
                                                    <Eye className="h-4 w-4 mr-1" /> Chi tiết
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {totalItems > 0 && (
                    <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                        <div className="text-sm text-muted-foreground">Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} / {totalItems}</div>
                        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                    </div>
                )}
            </Card>

            {/* Dialog Chi Tiết */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {/* ... (Phần Header và Content giữ nguyên code cũ) ... */}
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-blue-700">
                            <FileText className="h-6 w-6" /> CHI TIẾT HÓA ĐƠN #{selectedInvoice?.id}
                        </DialogTitle>
                        <DialogDescription>Phiếu: <b>#{selectedInvoice?.ticketId}</b> | {formatDateTime(selectedInvoice?.completedTime || '')}</DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6 py-2">
                            {/* ... (Giữ nguyên phần hiển thị thông tin Khách/Dịch vụ/Phụ tùng) ... */}
                            {/* Tóm tắt hiển thị lại ở đây cho gọn response */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded text-sm">
                                <div><b>Khách:</b> {selectedInvoice.customerName} - {selectedInvoice.customerPhone}</div>
                                <div className="text-right"><b>KTV:</b> {selectedInvoice.technicianName}</div>
                            </div>

                            <div className="border rounded overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-gray-100"><TableRow><TableHead>Mục</TableHead><TableHead className="text-right">Tiền</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {selectedInvoice.serviceItems.map((i,idx)=>(<TableRow key={'s'+idx}><TableCell>{i.itemName}</TableCell><TableCell className="text-right">{formatCurrency(i.unitPriceAtTimeOfService)}</TableCell></TableRow>))}
                                        {selectedInvoice.partsUsed.map((p,idx)=>(<TableRow key={'p'+idx}><TableCell>{p.partName} (x{p.quantity})</TableCell><TableCell className="text-right">{formatCurrency(p.quantity * p.unitPriceAtTimeOfService)}</TableCell></TableRow>))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded border border-blue-100">
                                <span className="text-lg font-bold text-blue-900">TỔNG CỘNG</span>
                                <span className="text-2xl font-bold text-red-600">{formatCurrency(selectedInvoice.grandTotal)}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="sm:justify-between gap-2">
                        <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Đóng</Button>

                        {/* NÚT XÁC NHẬN THANH TOÁN TIỀN MẶT */}
                        {selectedInvoice?.paymentStatus === 'PENDING' ? (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleConfirmCash(selectedInvoice.id)}
                                disabled={isConfirming}
                            >
                                {isConfirming ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Banknote className="h-4 w-4 mr-2"/>}
                                Xác nhận thu tiền mặt
                            </Button>
                        ) : (
                            <Button variant="secondary" disabled className="bg-green-100 text-green-700 opacity-100">
                                <CheckCircle className="h-4 w-4 mr-2"/> Đã thanh toán
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}