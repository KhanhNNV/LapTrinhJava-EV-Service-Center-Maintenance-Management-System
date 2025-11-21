package edu.uth.evservice.requests;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateBaseSalaryRequest {

    @NotNull(message = "Lương cơ bản không được để trống")
    @Min(value = 1_000_000, message = "Lương cơ bản phải ít nhất là 1,000,000 VND")
    private Long baseSalary;
}
