package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IInvoiceRepository extends JpaRepository<Invoice, Integer> {
}
