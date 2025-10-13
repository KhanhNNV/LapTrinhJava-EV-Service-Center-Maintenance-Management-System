package edu.uth.evservice.EVService.model;

import java.time.LocalDateTime;

import edu.uth.evservice.EVService.model.employee.Employee;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table (name="employee_noti")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeNoti {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notiId; 
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id",referencedColumnName = "employeeId", nullable = false) 
    private Employee employee;

    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
    
    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
