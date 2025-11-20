package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.SalaryDto;
import edu.uth.evservice.models.User;
import edu.uth.evservice.models.enums.Role;
import edu.uth.evservice.requests.UpdateCommissionRateByRoleRequest;
import edu.uth.evservice.services.ISalaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final ISalaryService salaryService;

    // 1. Endpoint tính lương (GET /api/salary/calculate)
    @GetMapping("/calculate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalaryDto>> calculateSalaries(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        List<SalaryDto> salaries = salaryService.calculateMonthlySalaries(month);
        return ResponseEntity.ok(salaries);
    }

    // 2. Endpoint cập nhật tỷ lệ hoa hồng (PUT /api/salary/technician-commission)
    @PutMapping("/technician-commission")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> updateTechnicianCommission(
            @Valid @RequestBody UpdateCommissionRateByRoleRequest request) {

        List<User> updatedUsers = salaryService.updateTechnicianCommissionRateByRole(request);
        return ResponseEntity.ok(updatedUsers);
    }

    // 3. Endpoint lấy tỷ lệ hoa hồng hiện tại (GET /api/salary/technician-commission)
    @GetMapping("/technician-commission")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UpdateCommissionRateByRoleRequest> getTechnicianCommission() {

        Double currentRate = salaryService.getTechnicianCommissionRate();

        UpdateCommissionRateByRoleRequest response = new UpdateCommissionRateByRoleRequest();
        response.setRole(Role.TECHNICIAN);
        response.setCommissionRate(currentRate);

        return ResponseEntity.ok(response);
    }
}