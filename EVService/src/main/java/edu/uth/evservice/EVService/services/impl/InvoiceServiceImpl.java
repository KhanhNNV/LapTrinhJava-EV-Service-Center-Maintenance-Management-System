package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.model.Invoice;
import edu.uth.evservice.EVService.model.ServiceTicket;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.IInvoiceRepository;
import edu.uth.evservice.EVService.requests.CreateInvoiceRequest;
import edu.uth.evservice.EVService.services.IInvoiceService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class InvoiceServiceImpl implements IInvoiceService {
    IInvoiceRepository invoiceRepository;

    @Override
    public List<InvoiceDto> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDto getInvoiceById(Integer id) {
        return invoiceRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public InvoiceDto createInvoice(CreateInvoiceRequest request) {
        Invoice invoice = new Invoice();
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setTotalAmount(request.getTotalAmount());
        invoice.setPaymentStatus(request.getPaymentStatus());
        invoice.setPaymentMethod(request.getPaymentMethod());
        //invoice.setServiceTicket(new ServiceTicket(request.getTicketId()));
        //invoice.setUser(new User(request.getUserId()));


        Invoice saved = invoiceRepository.save(invoice);
        return toDto(saved);
    }

    @Override
    public InvoiceDto updateInvoice(Integer id, CreateInvoiceRequest request) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    existing.setInvoiceDate(request.getInvoiceDate());
                    existing.setTotalAmount(request.getTotalAmount());
                    existing.setPaymentStatus(request.getPaymentStatus());
                    existing.setPaymentMethod(request.getPaymentMethod());
                    //existing.setTicketId(request.getTicketId());
                    //existing.setUserId(request.getUserId());

                    Invoice updated = invoiceRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteInvoice(Integer id) {
        invoiceRepository.deleteById(id);
    }

    private InvoiceDto toDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setInvoiceId(invoice.getInvoiceId());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setTotalAmount(invoice.getTotalAmount());
        dto.setPaymentStatus(invoice.getPaymentStatus());
        dto.setPaymentMethod(invoice.getPaymentMethod());
        //dto.setTicketId(invoice.getTicketId());
        //dto.setUserId(invoice.getUserId());
        return dto;
    }
}
