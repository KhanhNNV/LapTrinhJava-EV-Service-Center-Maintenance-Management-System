package edu.uth.evservice.services.billing;

import edu.uth.evservice.dtos.InvoiceDto;



public interface IInvoiceService {
    InvoiceDto createInvoiceForTicket(Integer ticketId, Integer staffId);

    InvoiceDto getInvoiceByTicketId(Integer ticketId);

    InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus);
}
