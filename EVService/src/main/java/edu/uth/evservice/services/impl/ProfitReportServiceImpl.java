package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.ProfitReportDto;
import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.IInvoiceRepository;
import edu.uth.evservice.repositories.IServiceTicketRepository;
import edu.uth.evservice.repositories.ITicketPartRepository;
import edu.uth.evservice.services.IProfitReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfitReportServiceImpl implements IProfitReportService {

    private final IServiceTicketRepository serviceTicketRepo;
    private final IInvoiceRepository invoiceRepo;
    private final ITicketPartRepository ticketPartRepo;

    @Override
    public ProfitReportDto getMonthlyProfitReport(int year, int month) {
        // Kiểm tra tham số
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Tháng phải nằm trong khoảng 1-12.");
        }
        if (year < 1900 || year > LocalDateTime.now().getYear()) {
            throw new IllegalArgumentException("Năm không hợp lệ: " + year);
        }

        // 1. Xác định thời gian
        LocalDateTime startOfMonth = YearMonth.of(year, month).atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.of(year, month).atEndOfMonth().atTime(23, 59, 59);

        // 2. Lấy tất cả ticket COMPLETED trong tháng
        List<ServiceTicket> completedTickets = serviceTicketRepo
                .findByStatusAndEndTimeBetween(ServiceTicketStatus.COMPLETED, startOfMonth, endOfMonth);

        if (completedTickets.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy ticket COMPLETED nào trong tháng " + month + "/" + year);
        }

        // 3. Tính tổng thu từ hóa đơn
        double totalRevenue = completedTickets.stream()
                .mapToDouble(ticket -> invoiceRepo.findByServiceTicket_TicketId(ticket.getTicketId())
                        .map(invoice -> invoice.getTotalAmount())
                        .orElse(0.0))
                .sum();
        long totalRevenueLong = Math.round(totalRevenue);

        long staffSalary = 10_000_000L;

        // Lương Technician
        Map<Integer, Long> technicianSalaryMap = new HashMap<>();
        for (ServiceTicket ticket : completedTickets) {
            if (ticket.getTechnician() == null) {
                throw new IllegalStateException("Ticket " + ticket.getTicketId() + " chưa gán kỹ thuật viên.");
            }
            Integer techId = ticket.getTechnician().getUserId();
            double ticketRevenue = invoiceRepo.findByServiceTicket_TicketId(ticket.getTicketId())
                    .map(invoice -> invoice.getTotalAmount())
                    .orElse(0.0);
            long currentSalary = technicianSalaryMap.getOrDefault(techId, 6_000_000L);
            technicianSalaryMap.put(techId, currentSalary + Math.round(0.3 * ticketRevenue));
        }
        long totalTechnicianSalary = technicianSalaryMap.values().stream().mapToLong(Long::longValue).sum();

        // Chi phí nhập Part
        long partCost = completedTickets.stream()
                .flatMap(ticket -> ticketPartRepo.findByTicket_TicketId(ticket.getTicketId()).stream())
                .mapToDouble(tp -> {
                    if (tp.getPart() == null) {
                        throw new IllegalStateException("TicketPart không có Part gán cho ticket " + tp.getId());
                    }
                    return tp.getQuantity() * tp.getPart().getCostPrice();
                })
                .mapToLong(Math::round)
                .sum();

        long totalExpense = staffSalary + totalTechnicianSalary + partCost;
        long profit = totalRevenueLong - totalExpense;

        return ProfitReportDto.builder()
                .month(month)
                .year(year)
                .totalRevenue(totalRevenueLong)
                .staffSalary(staffSalary)
                .technicianSalary(totalTechnicianSalary)
                .partCost(partCost)
                .totalExpense(totalExpense)
                .profit(profit)
                .build();
    }
}
