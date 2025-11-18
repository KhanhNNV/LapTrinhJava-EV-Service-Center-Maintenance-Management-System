import api from "./api";
import { authService } from "./auth";
import { ENDPOINTS } from "@/config/endpoints.ts";

export interface Appointment {
    appointmentId: number;
    appointmentDate: string; // Gồm cả ngày và giờ
    status: string;
    serviceType: string;
    note: string;
    // Các ID để dùng khi fetch chi tiết
    customerId: number;
    vehicleId: number;
    centerId: number;
}

// Interface cho chi tiết (đầy đủ)
export interface AppointmentDetailData {
    user: { fullName: string; phoneNumber: string };
    vehicle: { brand: string; model: string; licensePlate: string };
}

export const technicianService = {
    // 1. Chỉ lấy danh sách cơ bản (Rất nhanh)
    getMyAppointments: async (technicianId: number | undefined) => {
        if (!technicianId) return [];
        const response = await api.get("/api/appointments/technician");
        return response.data.filter((a: any) => a.technicianId === technicianId);
    },

    // 2. Hàm mới: Lấy chi tiết cho 1 cuộc hẹn (Chỉ chạy khi bấm nút)
    getAppointmentDetails: async (customerId: number, vehicleId: number): Promise<AppointmentDetailData> => {
        // Gọi song song 3 API con
        const [userRes, vehicleRes] = await Promise.all([
            api.get(`/api/users/${customerId}`),
            api.get(`/api/vehicles/manage/${vehicleId}`),
        ]);

        return {
            user: userRes.data,
            vehicle: vehicleRes.data,
        };
    }
};