import api from "./api";

export interface Certificate {
  certificateId: number;   
  certificateName: string
  description?: string;
  code?: string; // Mã chứng chỉ nếu có
}

export const certificateService = {
  // API lấy danh sách chứng chỉ (dành cho Admin/Tech)
  getAllCertificates: async () => {
    const response = await api.get<Certificate[]>("/certificates");
    return response.data;
  },
};