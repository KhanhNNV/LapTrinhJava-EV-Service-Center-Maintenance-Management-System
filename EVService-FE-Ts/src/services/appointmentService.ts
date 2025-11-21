// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import api from "@/services/api.ts";
// import { ENDPOINTS } from "@/config/endpoints.ts";
// import { toast } from "sonner";

// export interface AppointmentDto {
//     appointmentId: number;
//     appointmentDate: string; // Backend gửi về LocalDate/LocalDateTime dạng string
//     appointmentTime: string;
//     serviceType: string;
//     status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED'; // Khớp với Enum backend
//     note?: string;
    
//     // Các object lồng nhau
//     vehicle?: {
//         vehicleId: number;
//         licensePlate: string;
//         make: string;
//         model: string;
//     };
    
//     serviceTicket?: {
//         ticketId: number;
//         status: string;
//         invoice?: {
//             invoiceId: number;
//             totalAmount: number;
//             paymentMethod: string;
//             paymentStatus: string;
//         }
//     };
// }

// export interface ServiceTicketDto {
//     ticketId: number;
//     startTime: string;
//     endTime?: string;
//     status: string;
//     appointment: {
//         serviceType: string;
//         vehicle: {
//             licensePlate: string;
//             make: string;
//             model: string;
//         }
//     };
// }

// // Lấy danh sách xe của người dùng
// export function useCustomerVehicles() {
//     return useQuery({
//         queryKey: ["customer-vehicles"],
//         queryFn: async () => {
//             const res = await api.get(ENDPOINTS.vehicles.list.url);
//             return res.data;
//         },
//     });
// }

// // Lấy lịch hẹn của người dùng
// export function useCustomerAppointments() {
//     return useQuery({
//         queryKey: ["customer-appointments"],
//         queryFn: async () => {
//             const res = await api.get("/api/appointments/myAppointments");
//             return res.data;
//         },
//     });
// }

// // Đặt lịch hẹn
// export function useBookAppointment() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async (data: any) => {
//             const response = await api.post("/api/appointments", {
//                 ...data,
//                 appointmentDate: `${data.appointmentDate}T${data.appointmentTime}`,
//                 centerId: 1,
//                 contractId: 1,
//             });
//             return response.data;
//         },

//         onSuccess: () => {
//             toast.success("Đã đặt lịch hẹn thành công!");
//             queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
//         },

//         onError: () => {
//             toast.error("Không thể đặt lịch. Vui lòng thử lại.");
//         },
//     });
// }
// // Hàm lấy lịch sử khách hàng (Dùng cho Admin xem chi tiết)
// export const getCustomerAppointmentHistory = async (customerId: number | string): Promise<AppointmentDto[]> => {
//     const endpoint = ENDPOINTS.appointments.historyByCustomer(customerId);
//     const res = await api.get(endpoint.url);
//     return res.data;
// };

// // Hàm lấy lịch sử làm việc của kỹ thuật viên (Dùng cho Admin xem chi tiết)
// export const getTechnicianWorkHistory = async (technicianId: number | string): Promise<ServiceTicketDto[]> => {
//     const endpoint = ENDPOINTS.serviceTickets.historyByTechnician(technicianId);
//     const res = await api.get(endpoint.url);
//     return res.data;
// };


import api from "./api";
import { ENDPOINTS } from "@/config/endpoints";

// Định nghĩa Interface cho chuẩn dữ liệu
export interface AppointmentHistoryDto {
  appointmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  serviceType: string;
  status: string;
  note?: string;
  vehicle?: {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
  };
  serviceTicket?: {
    ticketId: number;
    invoice?: {
      totalAmount: number;
      paymentStatus: string;
    }
  };
  technicianName?: string;
  staffName?: string;
  staffId?: number;
  customerName?: string; // Dành cho Staff view
}

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
    const res = await api.request<any[]>({ // Có thể define interface TicketDto riêng
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  }
};