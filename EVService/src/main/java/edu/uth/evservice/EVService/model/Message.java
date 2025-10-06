package edu.uth.evservice.EVService.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.Nationalized;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "message")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    Integer messageId;

    @Column(name = "sender_id")
    Integer senderId;

    @Column(name = "sender_type")
    String senderType; // e.g. CUSTOMER, STAFF, SYSTEM

    @Nationalized
    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "timestamp")
    LocalDateTime timestamp;

    @Column(name = "conversation_id")
    Integer conversationId; // FK to conversation table (if exists)
}
