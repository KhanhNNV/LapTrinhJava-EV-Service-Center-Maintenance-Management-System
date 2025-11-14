package edu.uth.evservice.services.impl.billing;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import edu.uth.evservice.config.payment.VnPayConfig;
import edu.uth.evservice.dtos.payment.PaymentDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Invoice;
import edu.uth.evservice.models.PaymentTransaction;
import edu.uth.evservice.models.enums.PaymentGateway;
import edu.uth.evservice.models.enums.PaymentMethod;
import edu.uth.evservice.models.enums.PaymentStatus;
import edu.uth.evservice.models.enums.TransactionStatus;
import edu.uth.evservice.repositories.IInvoiceRepository;
import edu.uth.evservice.repositories.IPaymentTransactionRepository;
import edu.uth.evservice.services.billing.IPaymentService;
import edu.uth.evservice.services.impl.billing.helpers.VnPayHelper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {
    
    private final IInvoiceRepository invoiceRepository;
    private final IPaymentTransactionRepository transactionRepository;
    private final VnPayHelper vnPayHelper;
    private final VnPayConfig vnPayConfig;

    //. Hàm kiểm tra hóa đơn có hợp lệ để thanh toán không
    private Invoice validateInvoice(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán.");
        }
        if (invoice.getPaymentStatus() == PaymentStatus.CANCELLED) {
            throw new IllegalStateException("Hóa đơn này đã bị hủy.");
        }
        return invoice;
    }

    //. Tạo và lưu giao dịch vào CSDL (pending)
    private PaymentTransaction createPendingTransaction(Invoice invoice, String orderId, PaymentGateway gateway) {
        PaymentTransaction transaction = PaymentTransaction.builder()
                .invoice(invoice)
                .gateway(gateway)
                .orderId(orderId)
                .amount(invoice.getTotalAmount())
                .status(TransactionStatus.PENDING)
                .note("Tạo yêu cầu thanh toán " + gateway.name())
                .build();
        return transactionRepository.save(transaction);
    }

    @Override
    @Transactional
    public PaymentDto createVnPayPayment(Integer invoiceId, HttpServletRequest request) {
        //~ Kiểm tra nghiệp vụ
        Invoice invoice = this.validateInvoice(invoiceId);

        //~ Tạo OrderId
        String orderId = "EV_INV_" + invoiceId + "_" + System.currentTimeMillis();
        
        //~ Xử lý CSDL
        this.createPendingTransaction(invoice, orderId, PaymentGateway.VNPAY);

        //~ Nếu request đi qua proxy, load balancer hoặc Nginx,
        //~ thì giá trị này có thể là IP của proxy chứ không phải IP người dùng.
        String ipAddress = request.getRemoteAddr();

        return vnPayHelper.createPaymentUrl(invoice, orderId, ipAddress);
    }

    @Override
    public Map<String, String> processVnPayIpn(Map<String, String> ipnParams) {
        try{
            //- Kiểm tra có chữ ký của VNPAY không
            //~ Lấy chữ ký từ VNpay đã gửi
            String receiveHash = ipnParams.get("vnp_SecureHash");
            //~ Kiểm tra xem nó có null không
            if (receiveHash == null) {
                throw new SecurityException("vnp_SecureHash bi thieu");
            }

            //-  Xác thực chữ ký VNPAY chính xác không
            //~ Tách dữ liệu cần hash ra (loại bỏ thằng vnp_SecureHash)
            Map<String, String> dataToHash = new HashMap<>(ipnParams);
            dataToHash.remove("vnp_SecureHash");

            //~ Tạo một querystring mới để test thử chữ ký chính xác chứu
            String queryStringToHash = vnPayHelper.buildQueryString(dataToHash);
            //~ Thực hiện tạo chữ ký từ thằng queryString mới để so sánh với thằng vnp_SecureHash
            String calculateHash = vnPayHelper.hmacSHA512(vnPayConfig.getVnpayHashSecret(), queryStringToHash);
            
            //~ So sánh các chữ ký mới vừa tạo với thằng vpn_SecureHash lấy từ đầu hàm
            if(!calculateHash.equals(receiveHash)){
                throw new SecurityException("Khong dung ma VNPAY");
            }

            //- Nếu đúng chữ ký của VNPAY (XỮ LÝ NGHIỆP VỤ) 
            //~ Lấy thông tin Transaction từ database theo orderId
            String orderId = ipnParams.get("vnp_TxnRef");
            PaymentTransaction transaction = transactionRepository.findByOrderId(orderId)
                    .orElseThrow(() -> {
                        return new ResourceNotFoundException("OrderNotFound");
                    });

            //~ Kiểm tra xem tra xem tra dữ liệu có bị trùng lặp không lỡ 
            if (transaction.getStatus() == TransactionStatus.SUCCESS) {
                return Map.of("RspCode", "02", "Message", "Order da duoc hoan thanh");
            }

            //- Kiểm tra trạng thái thanh toán từ VNPAY
            String vnpayTransactionStatus = ipnParams.get("vnp_TransactionStatus");
            String vnpayResponseCode = ipnParams.get("vnp_ResponseCode");


            //~ GIAO DỊCH THÀNH CÔNG
            if ("00".equals(vnpayTransactionStatus) && "00".equals(vnpayResponseCode)){
                transaction.setStatus(TransactionStatus.SUCCESS);
                transaction.setGatewayTransactionId(ipnParams.get("vnp_TransactionNo"));
                transaction.setNote("Thanh toán VNPAY thành công");

                //~ Cập nhật bên invoice
                Invoice invoice = transaction.getInvoice();
                invoice.setPaymentStatus(PaymentStatus.PAID);
                invoice.setPaymentMethod(PaymentMethod.VNPAY);

                invoiceRepository.save(invoice);
                transactionRepository.save(transaction);
                return Map.of("RspCode", "00", "Message", "Xac nhan thanh cong");
            }
            else{
                //~ GIAO DỊCH THẤT BẠI
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setNote("Thanh toán VNPAY thất bại");
                transactionRepository.save(transaction);
                return  Map.of("RspCode", "00", "Message", "Xac nhan thanh cong nhung thanh toan that bai");

            }

        }catch(ResourceNotFoundException e) {
            if ("OrderNotFound".equals(e.getMessage())) {
                return Map.of("RspCode", "01", "Message", "Order Not Found");
            }
            return Map.of("RspCode", "99", "Message", "Unknown error");
        } catch (SecurityException e) {
             return Map.of("RspCode", "97", "Message", "Invalid Checksum");
        } catch (Exception e) {
            return Map.of("RspCode", "99", "Message", "Unknown error");
        }
    }

}
