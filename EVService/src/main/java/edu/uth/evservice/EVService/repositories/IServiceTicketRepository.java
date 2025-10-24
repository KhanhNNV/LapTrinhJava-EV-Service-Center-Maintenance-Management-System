package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.ServiceTicket;

/**
 * Repository cho ServiceTicket
 * Lưu ý: tên interface bắt đầu với "I" theo requirement của bạn
 */
@Repository
public interface IServiceTicketRepository extends JpaRepository<ServiceTicket, Integer> {
    List<ServiceTicket> findByTechnicianId(Integer technicianId);
}