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
  getVehiclesByCustomer: (customerId: number) =>
    api.get(`/api/vehicles/customer/${customerId}`),

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

  async getVehicleHistory(vehicleId: number) {
    const response = await api.get(`/api/service-tickets/vehicle/${vehicleId}/history`);
    return response.data;
  }
};

