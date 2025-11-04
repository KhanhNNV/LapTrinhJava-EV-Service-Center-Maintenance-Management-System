package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import edu.uth.evservice.models.enums.ServiceTicketStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "serviceTickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class ServiceTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Integer ticketId;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private ServiceTicketStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // 1 ticket liên kết tới 1 appointment
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    // technician là 1 User; nhiều ticket có thể thuộc 1 technician
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id", referencedColumnName = "user_id", nullable = false)
    private User technician;

    @OneToOne(mappedBy = "serviceTicket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Invoice invoice;

    @OneToMany(mappedBy = "serviceTicket", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TicketServiceItem> ticketServiceItems = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketPart> ticketParts = new ArrayList<>();

}
