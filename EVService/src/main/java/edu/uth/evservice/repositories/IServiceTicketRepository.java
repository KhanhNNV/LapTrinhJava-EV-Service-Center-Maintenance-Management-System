package edu.uth.evservice.repositories;

import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IServiceTicketRepository extends JpaRepository<ServiceTicket, Integer> {

    List<ServiceTicket> findByStatusAndEndTimeBetween(ServiceTicketStatus status, LocalDateTime start, LocalDateTime end);
    

    // Tìm tickets theo technician
    List<ServiceTicket> findByTechnician_UserId(Integer technicianId);
}