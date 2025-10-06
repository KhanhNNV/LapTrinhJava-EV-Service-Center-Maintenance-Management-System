package edu.uth.evservice.EVService.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_package")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long packageId;

    @Column(nullable = false)
    private String packageName;

    @Column(nullable = false)
    private Double price;

    private Integer duration; // số ngày/tháng/năm của gói

    private String description; // mô tả chi tiết gói dịch vụ
}
