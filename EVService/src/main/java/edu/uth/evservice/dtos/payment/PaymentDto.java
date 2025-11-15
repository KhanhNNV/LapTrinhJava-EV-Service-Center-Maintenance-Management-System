package edu.uth.evservice.dtos.payment;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PaymentDto {
    private String orderId; //~ Mã đơn hàng
    private String paymentUrl; //~ Link đầy đủ cho redirect 
}
