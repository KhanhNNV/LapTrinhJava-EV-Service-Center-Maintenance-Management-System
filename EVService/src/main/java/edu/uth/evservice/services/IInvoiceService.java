package edu.uth.evservice.services;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.requests.CreateInvoiceRequest;

import java.util.List;

public interface IInvoiceService {
    InvoiceDto createInvoiceForTicket(Integer ticketId, String username);

    InvoiceDto getInvoiceByTicketId(Integer ticketId);

    InvoiceDto updatePaymentStatus(Integer invoiceId, String newStatus);
}
