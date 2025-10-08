package edu.uth.evservice.EVService.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
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
@Table(name = "inventory")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer inventory_id;

    long quantity;
    long min_quantity;

    LocalDate createdAt;
    LocalDate updatedAt;

    @ManyToOne
    @JoinColumn(name = "part_id")
    private Integer part_id;

    @ManyToOne
    @JoinColumn(name = "center_id")
    private Integer center_id;
}