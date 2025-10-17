package edu.uth.evservice.EVService.model;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "parts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer partId;

    @Column(nullable = false, length = 100)
    private String partName;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double costPrice;

    // Quan hệ N:M với ServiceItem thông qua bảng trung gian
    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceItemPart> serviceItemParts;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<TicketPart> ticketParts;
}
