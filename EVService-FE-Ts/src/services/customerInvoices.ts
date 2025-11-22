import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import api from "@/services/api.ts";
import {toast} from "sonner";
import { ENDPOINTS } from "@/config/endpoints";

export interface TicketServiceItemDto {
    itemName: string;
    unitPriceAtTimeOfService: number;      // Giá tại thời điểm làm
}

export interface TicketPartDto {
    partName: string;
    quantity: number;
    unitPriceAtTimeOfService: number;
}

export interface InvoiceDto {
    id: number;
    ticketId?: number | null;
    contractId?: number | null;
    appointmentId: number;
    completedTime: string; // LocalDateTime trả về string ISO

    customerName: string;
    customerPhone: string;
    technicianName: string;
    staffName: string;

    serviceItems: TicketServiceItemDto[];
    partsUsed: TicketPartDto[];

    serviceTotal: number;
    partTotal: number;
    grandTotal: number;

    // Nếu backend có trả về trạng thái thanh toán thì thêm vào đây
    paymentStatus?: 'PENDING' | 'PAID'| 'FAILED';
}

export interface PaymentDto {
    orderId: string;    // Mã đơn hàng
    paymentUrl: string; // Link thanh toán
}
export const createPaymentUrl = async (invoiceId: number) => {
    const { method, url } = ENDPOINTS.payments.createVnPay(invoiceId);
    const res = await api.request<PaymentDto>({
        method,
        url,
    });
    return res.data;
};

export function useCreatePayment() {
    return useMutation({
        mutationFn: createPaymentUrl,
        onError: (error: any) => {
            console.error("Payment Error:", error);
            toast.error(
                error.response?.data?.message || 
                "Không thể tạo thanh toán. Vui lòng thử lại sau."
            );
        },
    });
}
export function useCustomerInvoices() {
    return useQuery<InvoiceDto[]>({
        queryKey: ["customer-invoices"],
        queryFn: async () => {
            const res = await api.get("/api/invoices/my-invoices", {
                params: { page: 0, limit: 100 }
                
            });
            // Kiểm tra xem BE trả về Page (có .content) hay List
            return res.data.content || res.data;
        },
    });
}

export function useAllInvoices() {
    return useQuery<InvoiceDto[]>({
        queryKey: ["all-invoices"], // Key khác để không bị trùng cache với customer
        queryFn: async () => {
            // Gọi endpoint lấy tất cả (Backend method getAllInvoices)
            const res = await api.get("/api/invoices");

            // Backend trả về List<InvoiceDto> nên lấy res.data trực tiếp
            return res.data;
        },
        staleTime: 1000 * 60 * 2, // Cache 2 phút
    });
}

export const updateInvoiceStatus = async (invoiceId: number) => {

    const res = await api.put(`/api/invoices/${invoiceId}/status`, null, {
        params: { status: 'PAID' }
    });
    return res.data;
};

export function useConfirmCashPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateInvoiceStatus,
        onSuccess: () => {
            toast.success("Đã xác nhận thanh toán tiền mặt thành công!");
            // Làm mới danh sách hóa đơn ngay lập tức
            queryClient.invalidateQueries({ queryKey: ["all-invoices"] });
        },
        onError: (error: any) => {
            console.error("Confirm Error:", error);
            toast.error(
                error.response?.data?.message ||
                "Lỗi khi xác nhận thanh toán."
            );
        },
    });
}
