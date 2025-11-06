package edu.uth.evservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.TicketPart;
import edu.uth.evservice.models.TicketPartId;

public interface ITicketPartRepository extends JpaRepository<TicketPart, TicketPartId> {
    List<TicketPart> findByServiceTicket_TicketId(Integer ticketId);
    Optional<TicketPart> findByServiceTicket_TicketIdAndPart_PartId(Integer ticketId, Integer partId);

}