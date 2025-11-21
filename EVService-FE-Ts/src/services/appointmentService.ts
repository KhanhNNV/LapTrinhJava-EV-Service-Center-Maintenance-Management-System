import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "./api";
import { ENDPOINTS } from "@/config/endpoints";

// --- INTERFACES (Dùng chung hoặc riêng tùy nhu cầu) ---

export interface AppointmentDto {
    appointmentId: number;
    appointmentDate: string;
    appointmentTime: string;
    serviceType: string;
    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'IN_PROGRESS';
    note?: string;
    vehicle?: {
        vehicleId: number;
        licensePlate: string;
        make?: string;
        brand?: string; // Merge brand/make
        model: string;
    };
    serviceTicket?: {
        ticketId: number;
        status: string;
        invoice?: {
            invoiceId: number;
            totalAmount: number;
            paymentMethod: string;
            paymentStatus: string;
        }
    };
}

// Interface mở rộng cho History (có thể dùng chung AppointmentDto nếu muốn)
export interface AppointmentHistoryDto extends AppointmentDto {
    technicianName?: string;
    staffName?: string;
    staffId?: number;
    customerName?: string;
}

// --- PART 1: REACT QUERY HOOKS (Dành cho Customer Client-side) ---

// 1. Lấy danh sách xe của người dùng (Customer)
export function useCustomerVehicles() {
    return useQuery({
        queryKey: ["customer-vehicles"],
        queryFn: async () => {
             // Fallback nếu ENDPOINTS chưa có structure này, bạn có thể thay bằng chuỗi cứng '/api/vehicles/my-vehicles'
            const url = ENDPOINTS.vehicles?.list?.url || '/api/vehicles/my-vehicles'; 
            const res = await api.get(url);
            return res.data;
        },
    });
}

// 2. Lấy lịch hẹn của người dùng (Customer)
export function useCustomerAppointments() {
    return useQuery({
        queryKey: ["customer-appointments"],
        queryFn: async () => {
            const res = await api.get("/api/appointments/myAppointments");
            return res.data;
        },
    });
}

// 3. Đặt lịch hẹn (Customer)
export function useBookAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post("/api/appointments", {
                ...data,
                // Format lại ngày giờ nếu cần thiết để khớp backend
                appointmentDate: data.appointmentDate, 
                // appointmentTime backend thường nhận string "HH:mm" hoặc "HH:mm:ss"
                centerId: 1, // Hardcode tạm hoặc lấy từ form
                 // contractId: 1, // Bỏ comment nếu cần
            });
            return response.data;
        },

        onSuccess: () => {
            toast.success("Đã đặt lịch hẹn thành công!");
            queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
        },

        onError: (error: any) => {
            console.error(error);
            toast.error("Không thể đặt lịch. Vui lòng thử lại.");
        },
    });
}

// --- PART 2: SERVICE OBJECT (Dành cho Admin/Staff/Refactored Components) ---

export const appointmentService = {
  // Lấy lịch sử của Customer
  async getCustomerHistory(customerId: number | string) {
    const endpoint = ENDPOINTS.appointments.historyByCustomer(customerId);
    const res = await api.request<AppointmentHistoryDto[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },

  // Lấy lịch sử xử lý của Staff
  async getStaffHistory(staffId: number | string) {
    const endpoint = ENDPOINTS.appointments.historyByStaff(staffId);
    const res = await api.request<AppointmentHistoryDto[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },

  // Lấy lịch sử làm việc của Technician (Thông qua Service Ticket)
  async getTechnicianHistory(technicianId: number | string) {
    const endpoint = ENDPOINTS.serviceTickets.historyByTechnician(technicianId);
    const res = await api.request<any[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  }
};