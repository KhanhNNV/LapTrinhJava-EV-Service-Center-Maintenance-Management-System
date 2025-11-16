package edu.uth.evservice.services.impl.billing.helpers;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

import edu.uth.evservice.config.payment.VnPayConfig;
import edu.uth.evservice.dtos.payment.PaymentDto;
import edu.uth.evservice.models.Invoice;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class VnPayHelper {

    private final VnPayConfig vnPayConfig;

    //. Tạo chữ ký HMAC-SHA512
    public String hmacSHA512(final String key, final String data) {
        try {

            if (key == null || data == null) {
                throw new NullPointerException("VNPAY khong key hoac null data");
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes();
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();

        } catch (Exception ex) {
            throw new RuntimeException("Khong the tao chu ky cho VNPAY", ex);
        }
    }

    //. Tạo query từ Map và sắp xếp theo chiều (A-Z)
    public String buildQueryString (Map<String,String> params){
        StringJoiner sj = new StringJoiner("&"); //~ Đây là một class Java giúp nối nhiều chuỗi với nhau bởi một ký tự cụ thể nào đó

        params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())//~ Sắp xếp theo bảng chữ cái Aphabet
                .forEach(e -> {
                    if (e.getValue() != null && !e.getValue().isEmpty()){
                        try {
                        sj.add( URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8.toString()) 
                                    + "=" +
                                URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8.toString())
                        );
                        }catch(UnsupportedEncodingException ex){
                            throw new RuntimeException("Ma hoa UTF_8 khong duoc ho tro", ex);    
                        }
                    }
                }); 
                return sj.toString();
    }

    //. Hàm chịu trách nhiệm tạo URL thanh toán VNPAY
    public PaymentDto createPaymentUrl (Invoice invoice, String orderId, String ipAddress){
        long amountInVnd = (long) (invoice.getTotalAmount() * 100);
        String vnpayCreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(Calendar.getInstance(TimeZone.getTimeZone("GMT+7")).getTime());
        Map<String, String> vnpayParams = new HashMap<>();
        vnpayParams.put("vnp_Version", vnPayConfig.getVnpayVersion());
        vnpayParams.put("vnp_Command", vnPayConfig.getVnpayCommand());
        vnpayParams.put("vnp_TmnCode", vnPayConfig.getVnpayTmnCode());
        vnpayParams.put("vnp_Amount", String.valueOf(amountInVnd));
        vnpayParams.put("vnp_CurrCode", "VND");
        vnpayParams.put("vnp_TxnRef", orderId);
        vnpayParams.put("vnp_OrderInfo", "Thanh toan don hang EVService: " + orderId);
        vnpayParams.put("vnp_OrderType", "other");
        vnpayParams.put("vnp_Locale", "vn");
        vnpayParams.put("vnp_ReturnUrl", vnPayConfig.getVnpayReturnUrl());
        vnpayParams.put("vnp_IpAddr", ipAddress);
        vnpayParams.put("vnp_CreateDate",vnpayCreateDate);
       // vnpayParams.put("vnp_IpnUrl", vnPayConfig.getVnpayIpnUrl());


        //~ Tạo query và sắp xếp và chữ ký
        String queryString = this.buildQueryString(vnpayParams);
        String hashData = this.hmacSHA512(vnPayConfig.getVnpayHashSecret(),queryString);
        String paymentUrl = vnPayConfig.getVnpayUrl() + "?" + queryString + "&vnp_SecureHash=" + hashData;

        return PaymentDto.builder()
                        .paymentUrl(paymentUrl)
                        .orderId(orderId)
                        .build();
    }
    
}
