package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
// import org.antlr.v4.runtime.misc.NotNull;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer notificationId;

    @Column(length = 50)
    @Nationalized
    String title;         // tiêu đề

    @Column(length = 255)
    @Nationalized
    String message;       // Nội dung chi tiết

    @Column(nullable = false)
    Boolean isRead = false;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
