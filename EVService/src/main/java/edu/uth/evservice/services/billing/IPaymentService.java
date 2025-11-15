package edu.uth.evservice.services.billing;

import java.util.Map;

import edu.uth.evservice.dtos.payment.PaymentDto;
import jakarta.servlet.http.HttpServletRequest;

public interface IPaymentService {
    //. Tạo yêu cầu thanh toán VNPAY
    PaymentDto createVnPayPayment(Integer invoiceId, HttpServletRequest request, Integer customerId);
    //. Xữ lý callBack IPN từ VNPAY
    Map<String,String> processVnPayIpn(Map<String, String> ipnParams);
}