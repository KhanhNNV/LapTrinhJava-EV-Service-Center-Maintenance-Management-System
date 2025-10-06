package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_noti")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerNoti {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notiId; // khóa chính

    private int customerId; // khách hàng nhận thông báo

    private String title;   // tiêu đề thông báo

    private String message; // nội dung chi tiết

    private boolean readStatus; // đã đọc chưa

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}