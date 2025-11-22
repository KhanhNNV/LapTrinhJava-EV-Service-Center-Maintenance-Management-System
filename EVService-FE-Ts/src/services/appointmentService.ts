import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api.ts";
import { toast } from "sonner";
import { ENDPOINTS } from "@/config/endpoints";

// --- INTERFACES (Dùng chung hoặc riêng tùy nhu cầu) ---

//Thông
export interface AdminAppointmentDto {
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

// --- INTERFACES (Khớp với Java DTOs) ---

// Khớp với VehicleDto.java
export interface VehicleDto {
    vehicleId: number;
    model: string;
    brand: string;
    licensePlate: string;
    recentMaintenanceDate: string;
    userId: number;
    // centerId: number;
    vehicleType: string;
}

// Khớp với ServicePackageDto.java
export interface ServicePackageDto {
    packageId: number; // Backend là packageId
    packageName: string;
    price: number;
    duration: number;
    description: string;
}

// Khớp với AppointmentDto.java
export interface AppointmentDto {
    appointmentId: number;
    appointmentDate: string;
    appointmentTime: string;
    serviceType: string;
    status: string; // PENDING, CONFIRMED, ...
    note: string;

    centerId: number;

    customerId?: number;
    customerName?: string;

    vehicleId: number;

    technicianId?: number;
    technicianName?: string;

    staffId?: number;
    staffName?: string;

    contractId?: number;
    contractName?: string;

    createdAt?: string;
    updatedAt?: string;
}
export interface CenterDto {
    centerId: number;
    centerName: string;
    address: string;
    phoneNumber: string;
    email: string;
}

export interface ServicePackageDto {
    packageId: number;
    packageName: string;
    price: number;
    duration: number;
    description: string;
}


// --- HOOKS ---
// Thêm Hook lấy danh sách trung tâm
export function useCenters() {
    return useQuery<CenterDto[]>({
        queryKey: ["centers"],
        queryFn: async () => {
            const res = await api.get("/api/service-centers");
            return res.data;
        },
    });
}

// Thêm các Hooks xử lý xe (Tách logic khỏi Page)
export function useAddVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            // Xử lý logic data ngay tại service
            const payload = { ...data, centerId: parseInt(data.centerId) };
            const res = await api.post("/api/vehicles", payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Thêm xe thành công");
            queryClient.invalidateQueries({ queryKey: ["customer-vehicles"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi thêm xe")
    });
}

export function useUpdateVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const payload = { ...data, centerId: parseInt(data.centerId) };
            const res = await api.put(`/api/vehicles/${id}`, payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Cập nhật xe thành công");
            queryClient.invalidateQueries({ queryKey: ["customer-vehicles"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Lỗi cập nhật xe")
    });
}

export function useDeleteVehicle() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/api/vehicles/${id}`);
        },
        onSuccess: () => {
            toast.success("Xóa xe thành công");
            queryClient.invalidateQueries({ queryKey: ["customer-vehicles"] });
        },
        onError: () => toast.error("Không thể xóa xe")
    });
}

// --- PART 1: REACT QUERY HOOKS (Dành cho Customer Client-side) ---

// 1. Lấy danh sách xe của người dùng (Customer) (Thông)
export function useMyCustomerVehicles() {
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
export function useCustomerVehicles() {
    return useQuery<VehicleDto[]>({
        queryKey: ["customer-vehicles"],
        queryFn: async () => {
            const res = await api.get("/api/vehicles");
            return res.data;
        },
    });
}

export function useServicePackages() {
    return useQuery<ServicePackageDto[]>({
        queryKey: ["service-packages"],
        queryFn: async () => {
            const res = await api.get("/api/service-packages");
            return res.data;
        },
    });
}

// Lấy lịch hẹn của người dùng(Thông)
export function adminuseCustomerAppointments() {
    return useQuery({
        queryKey: ["customer-appointments"],
        queryFn: async () => {
            const res = await api.get("/api/appointments/myAppointments");
            return res.data;
        },
    });
}

export function useCustomerAppointments() {
    return useQuery<AppointmentDto[]>({
        queryKey: ["customer-appointments"],
        queryFn: async () => {
            const res = await api.get("/api/appointments/myAppointments");
            return res.data;
        },
    });
}


// Đặt lịch hẹn
export function useBookAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            // Chuẩn bị data khớp với AppointmentRequest.java
            const requestBody = {
                appointmentDate: data.appointmentDate,
                appointmentTime: data.appointmentTime.length === 5 ? `${data.appointmentTime}:00` : data.appointmentTime,
                serviceType: data.serviceType,
                note: data.note || "",
                vehicleId: parseInt(data.vehicleId),
                centerId: parseInt(data.centerId),
            };

            const response = await api.post("/api/appointments", requestBody);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Đã đặt lịch hẹn thành công!");
            queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Không thể đặt lịch. Vui lòng thử lại.";
            toast.error(errorMessage);
        },
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointmentId: number) => {
            // Endpoint DELETE dùng appointmentId
            const response = await api.delete(`/api/appointments/${appointmentId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Đã hủy lịch hẹn thành công!");
            queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || "Không thể hủy lịch.";
            toast.error(errorMessage);
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