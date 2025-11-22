package edu.uth.evservice.services.impl.billing;

import java.util.HashMap;
import java.util.Map;

import edu.uth.evservice.models.User;
import edu.uth.evservice.requests.NotificationRequest;
import edu.uth.evservice.services.INotificationService;
import org.springframework.security.access.AccessDeniedException;
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
    private final INotificationService notificationService;

    //.(HELPER) Hàm kiểm tra hóa đơn có hợp lệ để thanh toán không
    private Invoice validateInvoice(Integer invoiceId, Integer customerId) {
        //~ Kiểm tra đơn có tồn tịa không
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn với ID: " + invoiceId));
        //~ Kiểm tra đơn phải quyền sở hữu khách hàng không
        if (!invoice.getUser().getUserId().equals(customerId)) {
            throw new AccessDeniedException("Bạn không có quyền thanh toán hóa đơn này.");
        }
        
        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Hóa đơn này đã được thanh toán.");
        }
        if (invoice.getPaymentStatus() == PaymentStatus.CANCELLED) {
            throw new IllegalStateException("Hóa đơn này đã bị hủy.");
        }
        return invoice;
    }

    //.(HELPER) Tạo và lưu bản ghi giao dịch với trạng thái PENDING trong CSDL
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
    //. KHỞI TẠO QUÁ TRÌNH THANH TOÁN CỦA VNPAY & TRẢ VỀ URL THANH TOÁN
    public PaymentDto createVnPayPayment(Integer invoiceId, HttpServletRequest request,Integer customerId) {
        //~ Kiểm tra nghiệp vụ
        Invoice invoice = this.validateInvoice(invoiceId, customerId);

        //~ Tạo OrderId
        String orderId = "EV_INV_" + invoiceId + "_" + System.currentTimeMillis();

        //~ Xử lý CSDL
        this.createPendingTransaction(invoice, orderId, PaymentGateway.VNPAY);

        //~ Nếu request đi qua proxy, load balancer hoặc Nginx,
        //~ thì giá trị này có thể là IP của proxy chứ không phải IP người dùng.
        String ipAddress = request.getRemoteAddr();

        //~ Tạo và trả về URL
        return vnPayHelper.createPaymentUrl(invoice, orderId, ipAddress);
    }

    @Override
    //. XỮ LÝ CALLBACK TỪ VNPAY ĐỂ CẬP NHẬT TRẠNG THÁI THANH TOÁN
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
            dataToHash.remove("vnp_SecureHashType");

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
                // 2. Thông báo cho STAFF (Người phụ trách lịch hẹn)
                try {
                    System.out.println("da chay thong bao");
                    User staff = invoice.getServiceTicket().getAppointment().getStaff();
                    if (staff != null) {
                        NotificationRequest staffNoti = new NotificationRequest();
                        staffNoti.setUserId(staff.getUserId());
                        staffNoti.setTitle("Hóa đơn đã thanh toán (VNPAY) ");
                        staffNoti.setMessage("Khách hàng " + invoice.getUser().getFullName() +
                                " đã thanh toán xong hóa đơn #" + invoice.getInvoiceId() + " qua VNPAY.");
                        notificationService.createNotification(staffNoti);
                    }
                } catch (Exception e) {
                    System.err.println("Lỗi gửi thông báo cho nhân viên: " + e.getMessage());
                }
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
