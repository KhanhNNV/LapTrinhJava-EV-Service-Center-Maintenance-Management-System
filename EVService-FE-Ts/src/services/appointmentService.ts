import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api.ts";
import { ENDPOINTS } from "@/config/endpoints.ts";
import { toast } from "sonner";

// Lấy danh sách xe của người dùng
export function useCustomerVehicles() {
  return useQuery({
    queryKey: ["customer-vehicles"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.vehicles.list.url);
      return res.data;
    },
  });
}

// Lấy lịch hẹn của người dùng
export function useCustomerAppointments() {
  return useQuery({
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
      const response = await api.post("/api/appointments", {
        ...data,
        appointmentDate: `${data.appointmentDate}T${data.appointmentTime}`,
        centerId: 1,
        contractId: 1,
      });
      return response.data;
    },

    onSuccess: () => {
      toast.success("Đã đặt lịch hẹn thành công!");
      queryClient.invalidateQueries({ queryKey: ["customer-appointments"] });
    },

    onError: () => {
      toast.error("Không thể đặt lịch. Vui lòng thử lại.");
    },
  });
}

//staff lấy lịch hẹn của khách hàng
export const appointmentService = {
  getAppointmentsByCustomer: (customerId: number) =>
    api.get(`/api/appointments/customer/${customerId}`),
  getAppointmentsByStatus: (status: string) =>
    api.get(`/api/appointments/status/${status}`),
};
