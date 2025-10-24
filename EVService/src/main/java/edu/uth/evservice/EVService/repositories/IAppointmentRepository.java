package edu.uth.evservice.EVService.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.Appointment;

@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomer_UserId(Integer userId);

    List<Appointment> findByCreatedBy_UserId(Integer userId);

    @Query("SELECT a FROM Appointment a JOIN a.serviceTickets st " +
            "WHERE st.technician.id = :technicianId " +
            "AND a.serviceType = 'SHIFT_ASSIGNMENT' " +
            "AND a.appointmentDate BETWEEN :startDate AND :endDate")
    List<Appointment> findSchedulesByTechnicianIdAndDateRange(
            @Param("technicianId") Integer technicianId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}