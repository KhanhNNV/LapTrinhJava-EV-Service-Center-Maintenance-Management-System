package edu.uth.evservice.services.billing;

import edu.uth.evservice.dtos.InvoiceDto;
import org.springframework.data.domain.Page;


public interface IInvoiceService {
    InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId);

    InvoiceDto getInvoiceByTicketId(Integer ticketId);

    InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus);

    Page<InvoiceDto> getMyInvoices(Integer userId, int page, int limit);
}
