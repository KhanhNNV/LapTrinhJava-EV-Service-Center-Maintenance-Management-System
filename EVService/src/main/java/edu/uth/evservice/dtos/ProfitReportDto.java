package edu.uth.evservice.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfitReportDto {
    private int month;
    private int year;
    private long totalRevenue;          // Tổng thu từ hóa đơn
    private long staffSalary;           // Lương Staff
    private long technicianSalary;      // Lương Technician
    private long partCost;              // Chi phí nhập Part
    private long totalExpense;          // Tổng chi
    private long profit;                // Lợi nhuận
}
