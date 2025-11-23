package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.SalaryDto;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.repositories.IServiceTicketRepository;
import edu.uth.evservice.requests.UpdateBaseSalaryRequest;
import edu.uth.evservice.requests.UpdateBaseSalaryByRoleRequest;
import edu.uth.evservice.requests.UpdateCommissionRateByRoleRequest;

import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.repositories.ITicketServiceItemRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.services.ISalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalaryServiceImpl implements ISalaryService {

    private final IUserRepository userRepository;

    private final IServiceTicketRepository serviceTicketRepository;;

    private static final Double DEFAULT_COMMISSION_RATE = 0.30;

    @Override
    public List<SalaryDto> calculateMonthlySalaries(YearMonth month) {
        long defaultStaffSalary = 10_000_000L;
        long defaultTechnicianSalary = 6_000_000L;

        if (month == null) {
            throw new IllegalArgumentException("Tháng không được để trống.");
        }

        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy người dùng nào trong hệ thống.");
        }

        return users.stream()
                .filter(user -> user.getRole() == Role.STAFF || user.getRole() == Role.TECHNICIAN)
                .map(user -> {
                    long baseSalary;
                    long bonus = 0L;
                    Double commissionRate = DEFAULT_COMMISSION_RATE;

                    if (user.getRole() == Role.STAFF) {
                        baseSalary = user.getBaseSalary() != null ? user.getBaseSalary() : defaultStaffSalary;
                    } else { // TECHNICIAN
                        baseSalary = user.getBaseSalary() != null ? user.getBaseSalary() : defaultTechnicianSalary;

                        commissionRate = user.getCommissionRate() != null ? user.getCommissionRate() : DEFAULT_COMMISSION_RATE;

                        double totalTicketValue = serviceTicketRepository.findAll()
                                .stream()
                                .filter(ticket -> {
                                    // 1. Check null cơ bản
                                    if (ticket == null || ticket.getTechnician() == null) return false;

                                    // 2. Check đúng Technician không
                                    if (!ticket.getTechnician().getUserId().equals(user.getUserId())) return false;

                                    // 3. Check trạng thái có phải là "HOÀN THÀNH" không?
                                    if (ticket.getStatus() != ServiceTicketStatus.COMPLETED) return false;

                                    // 4. Check tháng hoàn thành (EndTime)
                                    if (ticket.getEndTime() == null) return false;
                                    try {
                                        return YearMonth.from(ticket.getEndTime()).equals(month);
                                    } catch (Exception e) {
                                        return false;
                                    }
                                })
                                .count();

                        bonus = Math.round(totalTicketValue * commissionRate);
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

    @Override
    @Transactional
    public User updateBaseSalary(Long userId, UpdateBaseSalaryRequest request) {
        User user = userRepository.findById(userId.intValue())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));

        if (user.getRole() != Role.STAFF && user.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật lương cơ bản cho STAFF hoặc TECHNICIAN.");
        }

        user.setBaseSalary(request.getBaseSalary());
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public List<User> updateBaseSalaryByRole(UpdateBaseSalaryByRoleRequest request) {
        Role targetRole = request.getRole();

        if (targetRole != Role.STAFF && targetRole != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật lương cơ bản chung cho STAFF hoặc TECHNICIAN.");
        }

        List<User> usersToUpdate = userRepository.findAll().stream()
                .filter(user -> user.getRole() == targetRole)
                .collect(Collectors.toList());

        if (usersToUpdate.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy người dùng nào với vai trò: " + targetRole.name());
        }

        for (User user : usersToUpdate) {
            user.setBaseSalary(request.getBaseSalary());
        }

        return userRepository.saveAll(usersToUpdate);
    }

    // METHOD BỊ THIẾU: Đã thêm lại @Override
    @Override
    public Double getTechnicianCommissionRate() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.TECHNICIAN)
                .map(User::getCommissionRate)
                .filter(rate -> rate != null)
                .findFirst()
                .orElse(DEFAULT_COMMISSION_RATE);
    }

    @Override
    @Transactional
    public List<User> updateTechnicianCommissionRateByRole(UpdateCommissionRateByRoleRequest request) {
        if (request.getRole() != Role.TECHNICIAN) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật tỷ lệ hoa hồng chung cho TECHNICIAN.");
        }

        List<User> technicians = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.TECHNICIAN)
                .collect(Collectors.toList());

        if (technicians.isEmpty()) {
            throw new IllegalStateException("Không tìm thấy Kỹ thuật viên nào với vai trò: " + Role.TECHNICIAN.name());
        }

        Double newRate = request.getCommissionRate();

        for (User user : technicians) {
            user.setCommissionRate(newRate);
        }

        return userRepository.saveAll(technicians);
    }
}