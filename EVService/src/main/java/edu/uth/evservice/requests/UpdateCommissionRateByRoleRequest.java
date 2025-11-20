package edu.uth.evservice.requests;

import edu.uth.evservice.models.enums.Role;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateCommissionRateByRoleRequest {

    // Chỉ áp dụng cho TECHNICIAN
    @NotNull(message = "Vai trò không được để trống")
    private Role role = Role.TECHNICIAN;

    @NotNull(message = "Tỷ lệ hoa hồng không được để trống")
    @DecimalMin(value = "0.00", message = "Tỷ lệ phải lớn hơn hoặc bằng 0%")
    @DecimalMax(value = "1.00", message = "Tỷ lệ phải nhỏ hơn hoặc bằng 100%")
    private Double commissionRate;
}