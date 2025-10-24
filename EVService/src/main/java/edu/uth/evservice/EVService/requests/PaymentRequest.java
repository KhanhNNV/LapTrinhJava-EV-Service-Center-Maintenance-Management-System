package edu.uth.evservice.EVService.requests;

import lombok.Data;

// yêu cầu tạo một thanh toán mới từ client
@Data
public class PaymentRequest {
    private Integer appointmentId; // ID của lịch hẹn cần thanh toán
    private Integer customerId;
    private Double amount;
    private String paymentMethod; // "EWALLET", "BANKING", "CREDIT_CARD", etc.
}