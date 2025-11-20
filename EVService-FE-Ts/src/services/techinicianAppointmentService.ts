import api from "./api";


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

    staffName: string;
    technicianName: string;
}

// Interface cho chi tiết (đầy đủ)
export interface AppointmentDetailData {
    user: { fullName: string; phoneNumber: string };
    vehicle: { brand: string; model: string; licensePlate: string };
}

export const technicianService = {
    getMyAppointments: async (technicianId: number | undefined, status?: string) => {
        if (!technicianId) return [];
        const params: any = { technicianId };
        if (status && status !== "ALL") {
            params.status = status;
        }
        const response = await api.get("/api/appointments/technician",{params});
        return response.data
    },

    getAppointmentDetails: async (customerId: number, vehicleId: number): Promise<AppointmentDetailData> => {
        // Gọi song song 2 API con
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