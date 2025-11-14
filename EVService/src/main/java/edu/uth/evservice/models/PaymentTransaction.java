package edu.uth.evservice.models;

import java.time.LocalDateTime;

import edu.uth.evservice.models.enums.PaymentGateway;
import edu.uth.evservice.models.enums.TransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "payment_transactions")
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    Integer transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    Invoice invoice;

    @Enumerated(EnumType.STRING)
    @Column(name = "gateway", nullable = false)
    PaymentGateway gateway; 

    @Column(name = "order_id", nullable = false, unique = true)
    String orderId; 

    @Column(name = "gateway_transaction_id")
    String gatewayTransactionId;

    @Column(name = "amount", nullable = false)
    Double amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    TransactionStatus status; 

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "note", length = 500)
    String note; 

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

