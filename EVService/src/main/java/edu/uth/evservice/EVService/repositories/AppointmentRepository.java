package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByCustomerId(int customerId);
    List<Appointment> findByCenterId(int centerId);
    List<Appointment> findByStatus(String status);
}