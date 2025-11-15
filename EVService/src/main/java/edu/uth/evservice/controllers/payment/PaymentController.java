package edu.uth.evservice.controllers.payment;

import java.net.Authenticator;
import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import edu.uth.evservice.config.payment.VnPayConfig;
import edu.uth.evservice.dtos.payment.PaymentDto;
import edu.uth.evservice.services.billing.IPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController{
    private final IPaymentService paymentService;
    private final VnPayConfig vnPayConfig;

    //. Cho khách hàng gọi để tạo link thanh toán
    @PostMapping("/vnpay/{invoiceId}") 
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentDto> createVnPayPayment(@PathVariable Integer invoiceId, Authentication authentication, HttpServletRequest request){
        Integer customerId = Integer.parseInt(authentication.getName());
        
        PaymentDto createNewPayment = paymentService.createVnPayPayment(invoiceId, request, customerId);
        return ResponseEntity.ok(createNewPayment);
    }


    //. Cho VPNAY Sever gọi (IPN) để xác nhận thanh toán 
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> vnpayInpListener(@RequestParam Map<String, String> paramsVnpay, HttpServletRequest request){
        System.out.println("====== VNPAY IPN CALLED ======");
        Map<String, String> response = paymentService.processVnPayIpn(paramsVnpay);
        return ResponseEntity.ok(response);
    }

    //. Cho trình duyệt của User redirect về sau khi thanh toán
    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn (@RequestParam Map<String, String> paramsVnpay){
        System.out.println("====== VNPAY RETURN CALLED ======");
        UriComponentsBuilder urlBuilder = UriComponentsBuilder.fromUriString(vnPayConfig.getVnpayReturnUrl());
        //~ Gắn tất cả params của VNPAY vào url redirect
        paramsVnpay.forEach(urlBuilder::queryParam);
        String redirectUrl = urlBuilder.toUriString();
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }
}