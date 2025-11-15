package edu.uth.evservice.config.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;
@Configuration
@Getter
public class VnPayConfig {
    @Value("${VNPAY.VERSION}")
    private String vnpayVersion;
    @Value("${VNPAY.COMMAND}")
    private String vnpayCommand;
    @Value("${VNPAY.TMN-CODE}")
    private String vnpayTmnCode;
    @Value("${VNPAY.HASH-SECRET}")
    private String vnpayHashSecret;
    @Value("${VNPAY.URL}")
    private String vnpayUrl;
    @Value("${VNPAY.RETURN-URL}")
    private String vnpayReturnUrl;
    @Value("${VNPAY.IPN-URL}")
    private String vnpayIpnUrl;
}
