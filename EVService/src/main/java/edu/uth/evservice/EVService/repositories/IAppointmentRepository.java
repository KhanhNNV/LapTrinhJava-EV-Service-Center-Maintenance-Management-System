package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomer_UserId(Integer userId);
    List<Appointment> findByCreatedBy_UserId(Integer userId);
    @Query("SELECT a.createdBy.userId AS staffId, " +
            "a.createdBy.fullName AS staffName, " +
            "COUNT(a) AS totalAppointments, " +
            "SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedAppointments, " +
            "SUM(CASE WHEN a.status = 'PENDING' THEN 1 ELSE 0 END) AS pendingAppointments " +
            "FROM Appointment a " +
            "GROUP BY a.createdBy.userId, a.createdBy.fullName")
    List<Object[]> getEmployeePerformanceReport();

}
