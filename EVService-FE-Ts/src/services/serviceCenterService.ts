import { ENDPOINTS } from "@/config/endpoints";
import api  from "./api";

export interface ServiceCenter {
  centerId: number;      
  centerName: string;   
  address: string;
  phoneNumber?: string;
  email?: string;
}
export const serviceCenterService = {
  async getAllServiceCenters() {
    const endpoint = ENDPOINTS.serviceCenters.list;
    
    const res = await api.request<ServiceCenter[]>({
      method: endpoint.method,
      url: endpoint.url,
    });
    
    return res.data;
  },
};