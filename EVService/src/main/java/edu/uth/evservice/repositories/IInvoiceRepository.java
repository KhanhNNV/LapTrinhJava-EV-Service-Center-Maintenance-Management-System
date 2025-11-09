package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IInvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByServiceTicket_TicketId(Integer ticketId);
}
