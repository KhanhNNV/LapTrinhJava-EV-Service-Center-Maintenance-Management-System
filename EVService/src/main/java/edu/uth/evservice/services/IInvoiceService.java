package edu.uth.evservice.services;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.requests.CreateInvoiceRequest;

import java.util.List;

public interface IInvoiceService {
    List<InvoiceDto> getAllInvoices();
    InvoiceDto getInvoiceById(Integer id);
    InvoiceDto createInvoice(CreateInvoiceRequest request);
    InvoiceDto updateInvoice(Integer id, CreateInvoiceRequest request);
    void deleteInvoice(Integer id);
}
