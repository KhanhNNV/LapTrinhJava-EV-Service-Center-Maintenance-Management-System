import api from "./api.ts";
// Giả định ENDPOINTS đã được định nghĩa
// import { ENDPOINTS } from "@/config/endpoints";

export interface SalaryItem {
    userId: number;
    fullName: string;
    role: 'STAFF' | 'TECHNICIAN' | 'ADMIN';
    baseSalary: number;
    bonus: number;
    totalSalary: number;
}

// Giả định endpoint cho việc tính lương là: /api/users/calculate
// Tạm định nghĩa endpoint nếu ENDPOINTS không có sẵn trong ngữ cảnh này.
const SALARY_ENDPOINTS = {
    calculate_salary: {
        method: "GET",
        url: "/api/users/calculate" // API được cung cấp trong yêu cầu
    }
}
export interface CommissionPayload {
    commissionRate: number; // Ví dụ: 0.3
}
export const salaryService = {
    /**
     * Cập nhật tỷ lệ hoa hồng cho Kỹ thuật viên
     * @param data Payload chứa commissionRate (ví dụ: 0.3)
     */
    async updateTechnicianCommission(data: CommissionPayload){
        // Giả định có endpoint PUT để cập nhật tỷ lệ hoa hồng chung
        // Ví dụ: PUT /api/salary/technician-commission
        const endpoint = `/api/salary/technician-commission`;
        const res = await api.request<any>({
            method: 'PUT',
            url: endpoint,
            data: data,
        });
        return res.data;
    },

    /**
     * Lấy tỷ lệ hoa hồng hiện tại (Giả định, nếu cần)
     */
    async getTechnicianCommission(): Promise<number> {
        // Giả định API trả về commission rate (vd: {rate: 0.3})
        // Tạm thời hardcode nếu API chưa có, hoặc trả về giá trị mặc định của backend (0.3)
        // Trong môi trường thực tế, bạn sẽ gọi API GET ở đây.
        // const res = await api.request<any>({ method: 'GET', url: '/api/salary/technician-commission' });
        // return res.data.rate;
        return 0.3;
    },
    /**
     * Lấy danh sách tính lương của nhân viên/kỹ thuật viên theo tháng
     * @param month Tháng cần tính lương, định dạng YYYY-MM (ví dụ: 2025-11)
     */
    async getEmployeesSalary(month: string): Promise<SalaryItem[]> {
        const endpoint = SALARY_ENDPOINTS.calculate_salary;
        const res = await api.request<SalaryItem[]>({
            method: endpoint.method,
            url: endpoint.url,
            params: {
                month, // Chuyển month làm query parameter
            },
        });
        return res.data;
    }
}