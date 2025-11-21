import {useMutation, useQuery} from "@tanstack/react-query";
import api from "@/services/api.ts";
import {toast} from "sonner";

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
    // paymentStatus?: 'PENDING' | 'PAID';
}

export interface PaymentDto {
    orderId: string;    // Mã đơn hàng
    paymentUrl: string; // Link thanh toán
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
