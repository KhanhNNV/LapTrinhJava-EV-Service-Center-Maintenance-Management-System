package edu.uth.evservice.services;

import edu.uth.evservice.dtos.SalaryDto;
import edu.uth.evservice.models.User;
import edu.uth.evservice.requests.UpdateBaseSalaryByRoleRequest;
import edu.uth.evservice.requests.UpdateBaseSalaryRequest;
import edu.uth.evservice.requests.UpdateCommissionRateByRoleRequest;

import java.time.YearMonth;
import java.util.List;

public interface ISalaryService {
    List<SalaryDto> calculateMonthlySalaries(YearMonth month);
    // Bổ sung: Cập nhật lương cơ bản cho một người dùng
    User updateBaseSalary(Long userId, UpdateBaseSalaryRequest request);

    // Bổ sung: Cập nhật lương cơ bản cho tất cả người dùng theo vai trò
    List<User> updateBaseSalaryByRole(UpdateBaseSalaryByRoleRequest request);
    // BỔ SUNG: Cập nhật tỷ lệ hoa hồng cho tất cả Kỹ thuật viên
    List<User> updateTechnicianCommissionRateByRole(UpdateCommissionRateByRoleRequest request);
    Double getTechnicianCommissionRate();
}
