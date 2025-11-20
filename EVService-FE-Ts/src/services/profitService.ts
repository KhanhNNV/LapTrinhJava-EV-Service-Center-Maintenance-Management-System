import api from "./api.ts";

export interface ProfitReport {
    year: number;
    month: number;
    totalRevenue: number;
    staffSalary: number;
    technicianSalary: number;
    partCost: number;
    totalExpense: number;
    profit: number;
}

const PROFIT_ENDPOINT = "/api/users/profit";

export const profitService = {
    /**
     * Lấy báo cáo lợi nhuận chi tiết theo tháng và năm
     * @param year Năm
     * @param month Tháng (1-12)
     */
    async getProfitReport(year: number, month: number): Promise<ProfitReport> {

        const res = await api.request<ProfitReport>({
            method: 'GET',
            url: PROFIT_ENDPOINT,
            params: {
                year,
                month,
            },
        });
        return res.data;
    }
}