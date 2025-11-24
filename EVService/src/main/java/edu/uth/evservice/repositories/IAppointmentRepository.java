package edu.uth.evservice.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.Appointment;
import edu.uth.evservice.models.enums.AppointmentStatus;

@Repository
public interface IAppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomer_UserId(Integer userId);

    List<Appointment> findByStaff_UserId(Integer userId);

    List<Appointment> findByAssignedTechnician_UserId(Integer userId);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByAssignedTechnician_UserIdAndStatus(Integer technicianId, AppointmentStatus status);

    List<Appointment> findByAssignedTechnician_UserIdAndAppointmentDate(Integer technicianId,
            LocalDate appointmentDate);

    List<Appointment> findByCenter_CenterId(Integer centerId);
    List<Appointment> findByStatusAndCenter_CenterId(AppointmentStatus status, Integer centerId);
}