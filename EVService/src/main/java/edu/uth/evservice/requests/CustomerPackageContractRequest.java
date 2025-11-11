package edu.uth.evservice.requests;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerPackageContractRequest {
    @NotNull(message = "ID gói dịch vụ không được để trống")
    private Integer packageId;

    // Client chỉ cần id để mua/ dăng ký gói. truyền thêm gây lổ hổng bảo mật
    // private LocalDate startDate;
    // private String status;
}