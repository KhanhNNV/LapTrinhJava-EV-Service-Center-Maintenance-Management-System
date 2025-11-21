import api from "./api";

export const vehicleService = {
  getVehiclesByCustomer: (customerId: number) =>
    api.get(`/api/vehicles/customer/${customerId}`),
};
