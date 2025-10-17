package edu.uth.evservice.EVService.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel; //thay bang class part
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "inventories")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer inventoryId;

    @Column(nullable = false)
    private long quantity;

    @Column(nullable = false)
    private long minQuantity;

    @Column(nullable = true)
    private LocalDate createdAt;

    @Column(nullable = true)
    private LocalDate updatedAt;

    @ManyToOne
    @JoinColumn(name = "partId", referencedColumnName = "partId", nullable = false)
    private Part part;

    @ManyToOne
    @JoinColumn(name = "centerId", referencedColumnName = "centerId", nullable = false)
    private ServiceCenter serviceCenter;
}