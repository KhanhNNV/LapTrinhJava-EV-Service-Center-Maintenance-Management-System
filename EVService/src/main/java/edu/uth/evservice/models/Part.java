package edu.uth.evservice.models;

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
    @Column(name = "part_id")
    private Integer partId;

    @Column(name = "part_name", nullable = false, length = 100)
    private String partName;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "cost_price", nullable = false)
    private Double costPrice;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL,orphanRemoval = true)
    private Set<Inventory> inventories;

    // Quan hệ N:M với ServiceItem thông qua bảng trung gian
    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ServiceItemPart> serviceItemParts;

    @OneToMany(mappedBy = "part", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TicketPart> ticketParts;
}
