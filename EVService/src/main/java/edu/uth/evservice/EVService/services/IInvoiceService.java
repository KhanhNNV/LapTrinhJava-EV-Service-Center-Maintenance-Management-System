package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.requests.CreateInvoiceRequest;

import java.util.List;
import java.util.Map;

public interface IInvoiceService {
    List<InvoiceDto> getAllInvoices();
    InvoiceDto getInvoiceById(Integer id);
    InvoiceDto createInvoice(CreateInvoiceRequest request);
    InvoiceDto updateInvoice(Integer id, CreateInvoiceRequest request);
    void deleteInvoice(Integer id);
    Map<String, Object> getFinancialSummary();
    Map<String, Object> getAnalyticsReport();

}
