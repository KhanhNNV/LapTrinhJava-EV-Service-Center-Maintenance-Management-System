import {useMutation, useQuery} from "@tanstack/react-query";
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
    ticketId: number;
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
