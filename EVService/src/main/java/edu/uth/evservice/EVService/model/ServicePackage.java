package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "servicePackages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer packageId;

    @Column(nullable = false)
    private String packageName;

    @Column(nullable = false)
    private Double price;

    private Integer duration; // số ngày/tháng/năm của gói

    @Column(length = 1000)
    private String description; // mô tả chi tiết gói dịch vụ

    @OneToMany(mappedBy = "servicePackage", cascade = CascadeType.ALL)
    private List<CustomerPackageContract> customerPackageContracts =  new ArrayList<>();
}
