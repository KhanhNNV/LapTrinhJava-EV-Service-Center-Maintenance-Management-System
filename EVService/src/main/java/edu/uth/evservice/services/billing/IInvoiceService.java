package edu.uth.evservice.services.billing;

import edu.uth.evservice.dtos.InvoiceDto;
import org.springframework.data.domain.Page;

import java.util.List;


public interface IInvoiceService {
    InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId);

    InvoiceDto getInvoiceByTicketId(Integer ticketId);

    InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus);

    Page<InvoiceDto> getMyInvoices(Integer userId, int page, int limit);

    List<InvoiceDto> getAllInvoices();

    List<InvoiceDto> getInvoicesByUserId(Integer userId);
}
