package edu.uth.evservice.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import edu.uth.evservice.models.enums.ContractStatus;

@Entity
@Table(name = "customerPackageContracts")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CustomerPackageContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    Integer contractId;

    @Column(name = "contract_name")
    String contractName;

    @Column(name = "last_maintenance_notification_date")
    private LocalDate lastMaintenanceNotificationDate;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    User user;

    @ManyToOne
    @JoinColumn(name = "package_id", referencedColumnName = "package_id", nullable = false)
    ServicePackage servicePackage;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
    private List<Invoice> invoices = new ArrayList<>();

    // them moi
    @OneToMany(mappedBy = "contract")
    private List<Appointment> appointments = new ArrayList<>();

    @Column(name = "start_date", nullable = false)
    LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ContractStatus status;

}