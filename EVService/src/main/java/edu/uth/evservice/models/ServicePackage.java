package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Integer packageId;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "description", length = 1000)
    private String description;

    @OneToMany(mappedBy = "servicePackage", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CustomerPackageContract> customerPackageContracts = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "package_service_item", joinColumns = @JoinColumn(name = "package_id"), inverseJoinColumns = @JoinColumn(name = "item_id"))
    private List<ServiceItem> serviceItems = new ArrayList<>();
}
