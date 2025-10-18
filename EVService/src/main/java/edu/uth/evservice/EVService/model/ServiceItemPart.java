package edu.uth.evservice.EVService.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "serviceItemParts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemPart {

    @EmbeddedId
    ServiceItemPartId id; // Khóa chính kép

    @ManyToOne
    @MapsId("partId")
    @JoinColumn(name = "part_id")
    private Part part;

    @ManyToOne
    @MapsId("itemId")
    @JoinColumn(name = "item_id")
    private ServiceItem serviceItem;

    @Column(nullable=false)
    private Integer quantity;

    @Column(nullable=false)
    private Double unitPriceAtTimeOfService;
}
