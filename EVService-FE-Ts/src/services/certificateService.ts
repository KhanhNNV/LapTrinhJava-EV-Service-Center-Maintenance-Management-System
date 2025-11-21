import api from "./api";
import { ENDPOINTS } from "@/config/endpoints";
export interface Certificate {
  certificateId: number;
  certificateName: string;
  description?: string;
  code?: string;
  issuingOrganization?: string;
}

export const certificateService = {

  getAllCertificates: async () => {
    const endpoint = ENDPOINTS.certificates.list;

    const response = await api.request<Certificate[]>({
      method: endpoint.method,
      url: endpoint.url,
    });

    return response.data;
  },


  addMyCertificate: async (data: {
    certificateId: number;
    issueDate: string;
    credentialId: string;
    notes?: string
  }) => {
    const endpoint = ENDPOINTS.myCertificates.create;

    const response = await api.request({
      method: endpoint.method,
      url: endpoint.url,
      data: data
    });

    return response.data;
  }
};