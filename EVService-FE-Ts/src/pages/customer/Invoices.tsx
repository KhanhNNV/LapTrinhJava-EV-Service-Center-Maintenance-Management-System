import { useState, useMemo } from 'react'; // 1. Thêm useMemo
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Receipt, Calendar, CreditCard, Loader2, Wrench, Eye, User, Phone, CheckCircle } from 'lucide-react';
import { useCustomerInvoices, InvoiceDto, useCreatePayment } from '@/services/customerInvoices.ts';
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Invoices() {
    const queryClient = useQueryClient();
    const { data: invoices, isLoading } = useCustomerInvoices();
    const { mutateAsync: createPayment, isPending: isPaying } = useCreatePayment();
    // 2. LOGIC SẮP XẾP: Mới nhất lên đầu
    const sortedInvoices = useMemo(() => {
        if (!invoices) return [];

        // Tạo bản sao mảng để tránh mutate dữ liệu gốc
        return [...invoices].sort((a, b) => {
            // Cách 1: Sắp xếp theo ngày hoàn thành (completedTime)
            // Nếu bạn có trường 'createdAt' hoặc 'createdDate', hãy thay thế vào đây
            const timeA = new Date(a.completedTime || 0).getTime();
            const timeB = new Date(b.completedTime || 0).getTime();
            return timeB - timeA;

            // Cách 2 (Dự phòng): Nếu ngày tháng bị null, có thể sắp xếp theo ID giảm dần
            // return b.id - a.id;
        });
    }, [invoices]);

    // 3. Cấu hình phân trang: Truyền sortedInvoices vào đây
    const {
        currentData: currentInvoices,
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        indexOfFirstItem,
        indexOfLastItem
    } = usePagination(sortedInvoices, 6);

    // State để quản lý hóa đơn đang được xem chi tiết
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);

    // Hàm format tiền tệ an toàn (chống NaN)
    const formatCurrency = (amount: any) => {
        const value = Number(amount);
        const safeValue = isNaN(value) ? 0 : value;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeValue);
    };


    // --- HÀM TÍNH TOÁN TỔNG TIỀN (Frontend Calculation) ---
    // ... (Phần code còn lại giữ nguyên không đổi) ...
    const calculateServiceTotal = (items: any[]) => {
        if (!items) return 0;
        return items.reduce((sum, item) => {
            const price = Number(item.unitPriceAtTimeOfService || item.unitPrice || 0);
            return sum + price;
        }, 0);
    };

    const calculatePartTotal = (parts: any[]) => {
        if (!parts) return 0;
        return parts.reduce((sum, part) => {
            const price = Number(part.unitPriceAtTimeOfService || part.unitPrice || 0);
            const qty = Number(part.quantity || 0);
            return sum + (price * qty);
        }, 0);
    };

    const handlePayment = async (invoiceId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const paymentWindow = window.open('', '_blank');

        if (paymentWindow) {
            // Viết tạm nội dung thông báo trong lúc chờ Server trả link
            paymentWindow.document.write(`
                <html>
                    <head><title>Đang xử lý...</title></head>
                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">
                        <div style="text-align:center;">
                            <h2>Đang kết nối tới VNPay...</h2>
                            <p>Vui lòng không tắt cửa sổ này.</p>
                        </div>
                    </body>
                </html>
            `);
        }

        try {
            const data = await createPayment(invoiceId);

            if (data?.paymentUrl) {
                paymentWindow.location.href = data.paymentUrl;
            } else {
                paymentWindow.close();
                toast.error("Lỗi: Không nhận được link thanh toán.");
            }
        } catch (error) {
            paymentWindow.close();
            // Lỗi đã được handle ở hook mutation
        }
    };

    return (
        <div className="space-y-6">
            {/* ... Phần Render UI giữ nguyên ... */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Hóa đơn của tôi</h2>
                <p className="text-muted-foreground">Quản lý lịch sử dịch vụ và thanh toán</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {currentInvoices.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                                Bạn chưa có hóa đơn dịch vụ nào.
                            </div>
                        ) : (
                            // currentInvoices lúc này đã là dữ liệu đã được sắp xếp và cắt trang
                            currentInvoices.map((invoice: InvoiceDto) => (
                                <Card key={invoice.id} className="shadow-sm hover:shadow-md transition-all flex flex-col">
                                    {/* ... Nội dung Card ... */}
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-green-600" />
                                            Hóa đơn #{invoice.id}
                                        </div>

                                        {invoice.paymentStatus === 'PAID' ? (

                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                                Đã thanh toán
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                Chưa thanh toán
                                            </Badge>
                                        )}
                                    </CardHeader>

                                    <CardContent className="space-y-3 flex-1">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {invoice.completedTime ? new Date(invoice.completedTime).toLocaleString('vi-VN') : 'N/A'}
                                        </div>
                                        <div className="text-sm flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-gray-500" />
                                            Kỹ thuật viên: <span className="font-medium">{invoice.technicianName}</span>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-sm text-muted-foreground">Tổng thanh toán</span>
                                            <span className="text-xl font-bold text-red-600">
                                                {formatCurrency(invoice.grandTotal)}
                                            </span>
                                        </div>
                                    </CardContent>

                                    <CardFooter className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setSelectedInvoice(invoice)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> Chi tiết
                                        </Button>
                                        {invoice.paymentStatus === 'PAID' ? (
                                            <div className="w-full flex items-center justify-center text-green-600 font-bold border border-green-200 bg-green-50 rounded-md h-10">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Đã thanh toán
                                            </div>
                                        ) : (
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                                type="button"
                                                onClick={(e) => handlePayment(invoice.id, e)}
                                                disabled={isPaying}
                                            >
                                                {isPaying ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Thanh toán"}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                    {/* ... Phần Pagination Controls giữ nguyên ... */}
                    {totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-4 mt-4 gap-4">
                            <div className="text-sm text-muted-foreground text-center sm:text-left">
                                Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} trong số {totalItems} hóa đơn
                            </div>
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={goToPage}
                            />
                        </div>
                    )}
                </>
            )}

            {/* ... Phần Dialog giữ nguyên ... */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                {/* ... Nội dung Dialog ... */}
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {/* ... */}
                    <DialogHeader>
                        <DialogTitle className="text-xl text-center">CHI TIẾT HÓA ĐƠN DỊCH VỤ</DialogTitle>
                        <DialogDescription className="text-center">
                            Mã phiếu: #{selectedInvoice?.ticketId} - Lịch hẹn: #{selectedInvoice?.appointmentId}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6 py-2">
                            {/* ... Copy lại nội dung dialog cũ ... */}
                            {/* Thông tin khách hàng */}
                            <div className="bg-slate-50 p-3 rounded-lg border space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Khách hàng: <span className="font-semibold">{selectedInvoice.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    SĐT: <span>{selectedInvoice.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-gray-500" />
                                    KTV thực hiện: <span>{selectedInvoice.technicianName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-gray-500" />
                                    Nhân viên tiếp nhận: <span>{selectedInvoice.staffName}</span>
                                </div>
                            </div>

                            {/* 1. Bảng Dịch vụ */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm border-b pb-1 text-blue-700">I. Dịch vụ sử dụng</h4>
                                {selectedInvoice.serviceItems && selectedInvoice.serviceItems.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                <TableHead>Tên dịch vụ</TableHead>
                                                <TableHead className="text-right">Đơn giá</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedInvoice.serviceItems.map((item: any, index: number) => {
                                                const price = Number(item.unitPriceAtTimeOfService || item.unitPrice || 0);
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic px-2">Không có dịch vụ.</p>
                                )}

                                <div className="flex justify-between text-sm font-bold pt-2 px-2 border-t border-dashed">
                                    <span>Cộng tiền dịch vụ:</span>
                                    <span>{formatCurrency(calculateServiceTotal(selectedInvoice.serviceItems))}</span>
                                </div>
                            </div>

                            {/* 2. Bảng Phụ tùng */}
                            <div className="space-y-2 mt-4">
                                <h4 className="font-semibold text-sm border-b pb-1 text-orange-700">II. Phụ tùng thay thế</h4>
                                {selectedInvoice.partsUsed && selectedInvoice.partsUsed.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                <TableHead>Tên phụ tùng</TableHead>
                                                <TableHead className="text-center w-[60px]">SL</TableHead>
                                                <TableHead className="text-right">Đơn giá</TableHead>
                                                <TableHead className="text-right">Thành tiền</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedInvoice.partsUsed.map((part: any, index: number) => {
                                                const price = Number(part.unitPriceAtTimeOfService || part.unitPrice || 0);
                                                const qty = Number(part.quantity || 0);
                                                const total = price * qty;

                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium">{part.partName}</TableCell>
                                                        <TableCell className="text-center">{qty}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                                                        <TableCell className="text-right font-medium">
                                                            {formatCurrency(total)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic px-2">Không sử dụng phụ tùng.</p>
                                )}

                                <div className="flex justify-between text-sm font-bold pt-2 px-2 border-t border-dashed">
                                    <span>Cộng tiền phụ tùng:</span>
                                    <span>{formatCurrency(calculatePartTotal(selectedInvoice.partsUsed))}</span>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <span className="text-lg font-bold text-blue-900">TỔNG THANH TOÁN</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {formatCurrency(
                                        calculateServiceTotal(selectedInvoice.serviceItems) +
                                        calculatePartTotal(selectedInvoice.partsUsed)
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Đóng</Button>
                        {selectedInvoice && (
                            <>
                                {selectedInvoice.paymentStatus === 'PAID' ? (
                                    <Button disabled className="bg-green-100 text-green-700 border-green-200 opacity-100">
                                        <CheckCircle className="w-4 h-4 mr-2" /> Đã thanh toán
                                    </Button>
                                ) : (
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700"
                                        type="button"
                                        onClick={(e) => handlePayment(selectedInvoice.id, e)}
                                        disabled={isPaying}
                                    >
                                        {isPaying && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                                        Thanh toán ngay
                                    </Button>
                                )}
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}