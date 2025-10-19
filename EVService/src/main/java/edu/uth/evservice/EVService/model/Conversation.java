package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer conversationId;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false, length = 30)
    private String topic;

    @Column(nullable = false)
    private LocalDate startTime;

    @ManyToOne
    @JoinColumn(name = "customer_id",nullable = false)
    private User customerConversation; // FK -> User

    @ManyToOne
    @JoinColumn(name = "staff_id")
    private User staffConversation; // FK -> User

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Message> messages =  new ArrayList<>();

}
