import api from "./api.ts";
import { format } from 'date-fns'; // Giả định bạn dùng date-fns cho định dạng ngày

// Tái định nghĩa cấu trúc dữ liệu cho Frontend
export interface PerformanceService {
    technicianId: number;
    fullName: string;
    totalTickets: number;
    totalHours: number;
}

// Giả định endpoint cho hiệu suất
const PERFORMANCE_ENDPOINT = "/api/service-tickets/performance";

export const performanceService = {
    /**
     * Lấy báo cáo hiệu suất kỹ thuật viên trong khoảng ngày
     * @param start Ngày bắt đầu (Date object)
     * @param end Ngày kết thúc (Date object)
     */
    async getPerformanceReport(start: Date, end: Date): Promise<PerformanceService[]> {

        // Định dạng ngày theo chuẩn YYYY-MM-DD (ISO.DATE) mà backend Spring Boot cần
        const startDateString = format(start, 'yyyy-MM-dd');
        const endDateString = format(end, 'yyyy-MM-dd');

        const res = await api.request<PerformanceService[]>({
            method: 'GET',
            url: PERFORMANCE_ENDPOINT,
            params: {
                start: startDateString,
                end: endDateString,
            },
        });
        return res.data;
    }
}