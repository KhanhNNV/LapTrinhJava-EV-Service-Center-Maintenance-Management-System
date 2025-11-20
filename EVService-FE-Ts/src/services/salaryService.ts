import api from "./api.ts";
// Giả định ENDPOINTS đã được định nghĩa
// import { ENDPOINTS } from "@/config/endpoints";

// Giả định cấu trúc User được trả về từ API cập nhật
export interface User {
    userId: number;
    fullName: string;
    // ... thêm các trường khác nếu cần
}

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
        url: "/api/salary/calculate" // Đã chuyển sang SalaryController
    },
    technician_commission: {
        method: "PUT",
        url: "/api/salary/technician-commission" // Endpoint cập nhật
    },
    get_technician_commission: {
        method: "GET",
        url: "/api/salary/technician-commission" // Endpoint lấy giá trị
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
        const endpoint = SALARY_ENDPOINTS.technician_commission;

        const payload = {
            role: 'TECHNICIAN',
            commissionRate: data.commissionRate
        };

        // Đã sửa lỗi: Thay thế <any> bằng <User[]> (API backend trả về List<User>)
        const res = await api.request<User[]>({
            method: endpoint.method,
            url: endpoint.url,
            data: payload,
        });
        return res.data;
    },

    /**
     * Lấy tỷ lệ hoa hồng hiện tại
     */
    async getTechnicianCommission(): Promise<number> {
        const endpoint = SALARY_ENDPOINTS.get_technician_commission;

        // Backend trả về { role: 'TECHNICIAN', commissionRate: number }
        const res = await api.request<CommissionPayload>({
            method: endpoint.method,
            url: endpoint.url,
        });
        return res.data.commissionRate;
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