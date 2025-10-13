package edu.uth.evservice.EVService.model;

import java.util.List;

import edu.uth.evservice.EVService.model.employee.Employee;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "service_centers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer centerId;
    
    private String centerName;

    private String address;

    private String phoneNumber;

    private String email;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Employee> employees;

    @OneToMany(mappedBy = "serviceCenter", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vehicle> vehicles;
}