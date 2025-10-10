package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import edu.uth.evservice.EVService.model.EmployeeNoti;

public interface IEmployeeNotiRepository  extends JpaRepository<EmployeeNoti, Integer>{
    List<EmployeeNoti> findByEmployeeEmployeeId(int employeeId);
    List<EmployeeNoti> findByReadStatus(boolean readStatus);
}