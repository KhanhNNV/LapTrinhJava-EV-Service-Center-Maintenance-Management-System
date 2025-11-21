import { useQuery } from "@tanstack/react-query";
import api from "@/services/api.ts";

// Mapping với TechnicianCertificateDto trong Java
export interface TechnicianCertificateDto {
    technicianId: number;
    certificateId: number;
    certificateName: string;
    issuingOrganization: string;
    issueDate: string;   // LocalDate trả về string (YYYY-MM-DD)
    expiryDate?: string; // Có thể null nếu chứng chỉ vô thời hạn
    credentialId?: string;
}

export function useMyCertificates() {
    return useQuery<TechnicianCertificateDto[]>({
        queryKey: ["my-certificates"],
        queryFn: async () => {
            const res = await api.get("/api/my-certificates");
            return res.data;
        },
    });
}