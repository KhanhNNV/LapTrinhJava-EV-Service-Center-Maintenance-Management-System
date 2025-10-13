package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.TicketServiceItem;
import edu.uth.evservice.EVService.model.TicketServiceItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITicketServiceItemRepository extends JpaRepository<TicketServiceItem, TicketServiceItemId> {
}
