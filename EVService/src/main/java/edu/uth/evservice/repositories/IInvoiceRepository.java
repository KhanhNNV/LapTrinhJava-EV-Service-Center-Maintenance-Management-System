package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IInvoiceRepository extends JpaRepository<Invoice, Integer> {
    Optional<Invoice> findByServiceTicket_TicketId(Integer ticketId);

    Page<Invoice> findByUser_UserId(Integer userId, Pageable pageable);
}
