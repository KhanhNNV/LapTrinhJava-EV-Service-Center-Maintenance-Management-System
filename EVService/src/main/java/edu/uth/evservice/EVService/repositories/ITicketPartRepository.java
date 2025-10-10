package edu.uth.evservice.EVService.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.EVService.model.TicketPart;
import edu.uth.evservice.EVService.model.TicketPartId;

public interface ITicketPartRepository extends JpaRepository<TicketPart, TicketPartId> {
    // Tìm tất cả các TicketPart theo ticket_id
    List<TicketPart> findByTicketId(Integer ticketId);

    // Tìm tất cả các TicketPart theo part_id
    List<TicketPart> findByPartId(Integer partId);

    // Tìm các TicketPart theo ticket_id và part_id
    List<TicketPart> findByTicketIdAndPartId(Integer ticketId, Integer partId);
}