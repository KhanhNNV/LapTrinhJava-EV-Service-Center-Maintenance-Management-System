import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api.ts";
import { toast } from "sonner";

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
    customerId: number;
    vehicleId: number;
    // Yêu cầu: hiển thị chi tiết (sẽ dùng trong History)
    centerId: number;
    technicianId?: number;
    staffId?: number;
    contractId?: number;
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

export function useCustomerAppointments() {
    return useQuery<AppointmentDto[]>({
        queryKey: ["customer-appointments"],
        queryFn: async () => {
            const res = await api.get("/api/appointments/myAppointments");
            return res.data;
        },
    });
}

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
                contractId: 1,
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