package edu.uth.evservice.EVService.requests;

import lombok.Data;

// yêu cầu xác nhận trạng thái thanh toán
@Data
public class PaymentConfirmationRequest {
    private String status; // Ví dụ: "PAID", "FAILED"
}