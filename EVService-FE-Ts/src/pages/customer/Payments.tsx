import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Calendar, CreditCard, Loader2, User, Wrench } from 'lucide-react';
import { useCustomerInvoices, useCreateVnPayPayment, InvoiceDto } from '@/services/appointmentService.ts';

export default function Payments() {
    const { data: invoices, isLoading } = useCustomerInvoices();
    
    // Hook thanh toán VNPay
    const createPaymentMutation = useCreateVnPayPayment();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handlePayment = (ticketId: number) => {
        createPaymentMutation.mutate(ticketId);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Hóa đơn dịch vụ</h2>
            <p className="text-muted-foreground">Danh sách phiếu dịch vụ và thanh toán</p>
            
            {isLoading ? <div>Đang tải dữ liệu...</div> : (
                <div className="space-y-4">
                    {invoices?.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg">
                            Hiện chưa có hóa đơn nào.
                        </div>
                    ) : (
                        invoices?.map((invoice: InvoiceDto) => (
                            <Card key={invoice.ticketId} className="shadow-sm hover:shadow-md transition-all">
                                <CardContent className="pt-6 flex justify-between items-start">
                                    
                                    {/* Phần thông tin bên trái */}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Receipt className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg">Phiếu dịch vụ #{invoice.ticketId}</h3>
                                            
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="w-3 h-3"/> 
                                                Hoàn thành: {invoice.completedTime ? new Date(invoice.completedTime).toLocaleDateString('vi-VN') : 'N/A'}
                                            </div>
                                            
                                            <div className="text-xs text-gray-500 mt-1">
                                                Mã lịch hẹn: {invoice.appointmentId}
                                            </div>

                                            <div className="text-xs text-gray-600 flex items-center gap-2 mt-2">
                                                <Wrench className="w-3 h-3" /> KTV: {invoice.technicianName}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phần Tổng tiền & Nút thanh toán bên phải */}
                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Tổng cộng</div>
                                            <div className="text-xl font-bold text-blue-600">
                                                {formatCurrency(invoice.grandTotal)}
                                            </div>
                                        </div>
                                        
                                        {/* Nút Thanh toán VNPay */}
                                        {/* Lưu ý: Do InvoiceDto không có trường status, ta mặc định hiển thị nút thanh toán.
                                            Nếu muốn ẩn khi đã thanh toán, Backend cần trả thêm trường status hoặc client tự xử lý logic khác. */}
                                        <Button 
                                            size="sm" 
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                            onClick={() => handlePayment(invoice.ticketId)}
                                            disabled={createPaymentMutation.isPending}
                                        >
                                            {createPaymentMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                            ) : (
                                                <CreditCard className="w-4 h-4 mr-2"/>
                                            )}
                                            Thanh toán VNPay
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}