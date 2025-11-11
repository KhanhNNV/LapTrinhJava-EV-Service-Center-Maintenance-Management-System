package edu.uth.evservice.models;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "inventories")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inventory_id")
    private Integer inventoryId;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "min_quantity", nullable = false)
    private Long minQuantity;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    private ServiceCenter serviceCenter;
}
