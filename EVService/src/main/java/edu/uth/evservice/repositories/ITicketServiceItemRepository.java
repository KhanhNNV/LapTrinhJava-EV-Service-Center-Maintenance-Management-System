package edu.uth.evservice.repositories;

import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.TicketServiceItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITicketServiceItemRepository extends JpaRepository<TicketServiceItem, TicketServiceItemId> {
    List<TicketServiceItem> findByServiceTicket_TicketId(Integer ticketId);
}
