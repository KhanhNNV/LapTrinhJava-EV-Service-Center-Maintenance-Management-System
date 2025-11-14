package edu.uth.evservice.repositories;

import edu.uth.evservice.models.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPaymentTransactionRepository extends JpaRepository<PaymentTransaction, Integer> {

    /**
     * . Tìm kiếm một giao dịch dựa trên mã đơn hàng (orderId)
     * . mà hệ thống của chúng ta đã tạo ra.
     * . Rất quan trọng để xử lý IPN callback.
     */
    Optional<PaymentTransaction> findByOrderId(String orderId);
}