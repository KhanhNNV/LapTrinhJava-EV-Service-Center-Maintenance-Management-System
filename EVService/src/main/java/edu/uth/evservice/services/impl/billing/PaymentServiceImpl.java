package edu.uth.evservice.services.impl.billing;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import edu.uth.evservice.dtos.payment.PaymentDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Invoice;
import edu.uth.evservice.models.PaymentTransaction;
import edu.uth.evservice.models.enums.PaymentGateway;
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
            //~ Kiểm tra có chữ ký của VNPAY không
            String receiveHash = ipnParams.get("vnp_SecureHash");
            if (receiveHash == null) {
                throw new SecurityException("vnp_SecureHash bi thieu");
            }

            //~ Xác thực chữ ký VNPAY đúng không
            Map<String, String> dataToHash = new HashMap<>(ipnParams);
        }
    }

}
