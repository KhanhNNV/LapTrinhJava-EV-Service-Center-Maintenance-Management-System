package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.SalaryDto;
import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.ITicketServiceItemRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.services.ISalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl implements ISalaryService {

    private final IUserRepository userRepository;
    private final ITicketServiceItemRepository ticketServiceItemRepository;

    @Override
    public List<SalaryDto> calculateMonthlySalaries(YearMonth month) {
        List<User> users = userRepository.findAll();

        return users.stream()
                .filter(user -> user.getRole() == Role.STAFF || user.getRole() == Role.TECHNICIAN)
                .map(user -> {
                    long baseSalary;
                    long bonus = 0L;

                    if (user.getRole() == Role.STAFF) {
                        baseSalary = 10_000_000L;
                    } else {
                        baseSalary = 6_000_000L;

                        // Tính tổng giá trị ticket của technician trong tháng
                        double totalTicketValue = ticketServiceItemRepository.findAll()
                                .stream()
                                .filter(item -> {
                                    if (item.getServiceTicket() == null) return false;
                                    if (item.getServiceTicket().getTechnician() == null) return false;
                                    if (!item.getServiceTicket().getTechnician().getUserId().equals(user.getUserId())) return false;

                                    // Lấy ngày từ invoice
                                    if (item.getServiceTicket().getInvoice() == null) return false;
                                    return YearMonth.from(item.getServiceTicket().getInvoice().getInvoiceDate()).equals(month);
                                })
                                .mapToDouble(i -> i.getUnitPriceAtTimeOfService() * i.getQuantity())
                                .sum();

                        bonus = Math.round(totalTicketValue * 0.3);
                    }

                    return SalaryDto.builder()
                            .userId(user.getUserId().longValue())
                            .fullName(user.getFullName())
                            .role(user.getRole().name())
                            .baseSalary(baseSalary)
                            .bonus(bonus)
                            .totalSalary(baseSalary + bonus)
                            .build();
                })
                .collect(Collectors.toList());
    }

}
