import api from "./api";
import { ENDPOINTS } from "@/config/endpoints";

export interface Vehicle {
  vehicleId: number;
  model: string;
  brand: string;
  licensePlate: string;
  recentMaintenanceDate?: string;
  vehicleType: 'ELECTRIC_CAR' | 'ELECTRIC_MOTORBIKE';
  userId: number;
}

export const vehicleService = {
  // Lấy danh sách xe của chính mình (Customer)
  async getMyVehicles() {
    const endpoint = ENDPOINTS.vehicles.list;
    const res = await api.request<Vehicle[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },

  // [ADMIN] Lấy danh sách xe của một User bất kỳ
  async getVehiclesByUserId(userId: number | string) {
    const endpoint = ENDPOINTS.vehicles.byUser(userId);
    const res = await api.request<Vehicle[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    return res.data;
  },
};