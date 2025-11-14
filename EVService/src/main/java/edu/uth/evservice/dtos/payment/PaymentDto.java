package edu.uth.evservice.dtos.payment;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PaymentDto {
    private String paymentUrl; //~ Link đầy đủ cho redirect 
    private String qrCodeUrl;  //~ Link để tạo mã QR 
}
