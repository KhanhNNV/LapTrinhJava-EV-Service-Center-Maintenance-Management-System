package edu.uth.evservice.repositories;

import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.TicketServiceItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITicketServiceItemRepository extends JpaRepository<TicketServiceItem, TicketServiceItemId> {
}
