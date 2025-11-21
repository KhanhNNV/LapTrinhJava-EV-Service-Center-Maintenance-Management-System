import { useState } from 'react';
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
import { Receipt, Calendar, CreditCard, Loader2, Wrench, Eye, User, Phone } from 'lucide-react';
import { useCustomerInvoices, InvoiceDto } from '@/services/customerInvoices.ts';
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/common/PaginationControls";

export default function Invoices() {
    const { data: invoices, isLoading } = useCustomerInvoices();

    // Cấu hình phân trang
    const {
        currentData: currentInvoices,
        currentPage,
        totalPages,
        goToPage,
        totalItems,
        indexOfFirstItem,
        indexOfLastItem
    } = usePagination(invoices || [], 6); // 6 items per page

    // State để quản lý hóa đơn đang được xem chi tiết
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null);

    // Hàm format tiền tệ an toàn (chống NaN)
    const formatCurrency = (amount: any) => {
        const value = Number(amount);
        const safeValue = isNaN(value) ? 0 : value;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeValue);
    };


    // --- HÀM TÍNH TOÁN TỔNG TIỀN (Frontend Calculation) ---
    // Tính tổng tiền Dịch vụ: Cộng dồn đơn giá (theo yêu cầu của bạn)
    const calculateServiceTotal = (items: any[]) => {
        if (!items) return 0;
        return items.reduce((sum, item) => {
            // Ưu tiên unitPriceAtTimeOfService, fallback về unitPrice
            const price = Number(item.unitPriceAtTimeOfService || item.unitPrice || 0);
            return sum + price;
        }, 0);
    };

    // Tính tổng tiền Phụ tùng: Cộng dồn (Đơn giá * Số lượng)
    const calculatePartTotal = (parts: any[]) => {
        if (!parts) return 0;
        return parts.reduce((sum, part) => {
            const price = Number(part.unitPriceAtTimeOfService || part.unitPrice || 0);
            const qty = Number(part.quantity || 0);
            return sum + (price * qty);
        }, 0);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Hóa đơn của tôi</h2>
                <p className="text-muted-foreground">Quản lý lịch sử dịch vụ và thanh toán</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin"/></div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                        {currentInvoices.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                                Bạn chưa có hóa đơn dịch vụ nào.
                            </div>
                        ) : (
                            currentInvoices.map((invoice: InvoiceDto) => (
                                <Card key={invoice.id} className="shadow-sm hover:shadow-md transition-all flex flex-col">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            <Receipt className="w-5 h-5 text-blue-600"/>
                                            Hóa đơn #{invoice.id}
                                        </div>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            Hoàn thành
                                        </Badge>
                                    </CardHeader>

                                    <CardContent className="space-y-3 flex-1">
                                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Calendar className="w-4 h-4"/>
                                            {invoice.completedTime ? new Date(invoice.completedTime).toLocaleString('vi-VN') : 'N/A'}
                                        </div>
                                        <div className="text-sm flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-gray-500"/>
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
                                            <Eye className="w-4 h-4 mr-2"/> Chi tiết
                                        </Button>
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            //onClick={() => handlePayment(invoice.ticketId)}
                                            //disabled={createPaymentMutation.isPending}
                                        >
                                            {/*{createPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <CreditCard className="w-4 h-4 mr-2"/>}*/}
                                            Thanh toán
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
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

            {/* --- DIALOG CHI TIẾT HÓA ĐƠN --- */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-center">CHI TIẾT HÓA ĐƠN DỊCH VỤ</DialogTitle>
                        <DialogDescription className="text-center">
                            Mã phiếu: #{selectedInvoice?.ticketId} - Lịch hẹn: #{selectedInvoice?.appointmentId}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-6 py-2">
                            {/* Thông tin khách hàng */}
                            <div className="bg-slate-50 p-3 rounded-lg border space-y-1 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500"/>
                                    Khách hàng: <span className="font-semibold">{selectedInvoice.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500"/>
                                    SĐT: <span>{selectedInvoice.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-gray-500"/>
                                    KTV thực hiện: <span>{selectedInvoice.technicianName}</span>
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
                                            {selectedInvoice.serviceItems.map((item: any, index) => {
                                                // Xử lý giá an toàn cho từng dòng
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

                                {/* Tổng tiền Dịch vụ (Tính toán lại ở FE) */}
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
                                            {selectedInvoice.partsUsed.map((part: any, index) => {
                                                // Xử lý giá và số lượng an toàn
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

                                {/* Tổng tiền Phụ tùng (Tính toán lại ở FE) */}
                                <div className="flex justify-between text-sm font-bold pt-2 px-2 border-t border-dashed">
                                    <span>Cộng tiền phụ tùng:</span>
                                    <span>{formatCurrency(calculatePartTotal(selectedInvoice.partsUsed))}</span>
                                </div>
                            </div>

                            <Separator className="my-4"/>

                            {/* Tổng cộng cuối cùng */}
                            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <span className="text-lg font-bold text-blue-900">TỔNG THANH TOÁN</span>
                                {/* Tính tổng lại 1 lần nữa để đảm bảo khớp với các thành phần con */}
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
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                //onClick={() => handlePayment(selectedInvoice.ticketId)}
                                //disabled={createPaymentMutation.isPending}
                            >
                                {/*{createPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <CreditCard className="w-4 h-4 mr-2"/>}*/}
                                Thanh toán ngay
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}