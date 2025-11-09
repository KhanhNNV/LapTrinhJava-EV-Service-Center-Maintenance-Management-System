package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.TicketPart;
import edu.uth.evservice.models.TicketPartId;

public interface ITicketPartRepository extends JpaRepository<TicketPart, TicketPartId> {
    List<TicketPart> findByTicket_TicketId(Integer ticketId);

    boolean existsByPart_PartId(Integer partId);
}