package edu.uth.evservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.models.TicketPart;
import edu.uth.evservice.models.TicketPartId;

public interface ITicketPartRepository extends JpaRepository<TicketPart, TicketPartId> {
    // Tìm tất cả các TicketPart theo ticket_id
    List<TicketPart> findByTicket_TicketId(Integer ticketId);

    // Tìm tất cả các TicketPart theo part_id
    List<TicketPart> findByPart_PartId(Integer partId);

}