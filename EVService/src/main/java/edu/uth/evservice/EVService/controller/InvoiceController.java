package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.model.Invoice;
import edu.uth.evservice.EVService.services.InvoiceService;

import java.util.List;
import java.util.stream.Collectors;

public class InvoiceController {

    private InvoiceService invoiceService;

    // Constructor
    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // ==========================
    // Mapper Entity -> DTO
    // ==========================
    public InvoiceDto toDTO(Invoice invoice) {
        return new InvoiceDto(
                invoice.getInvoiceId(),
                invoice.getCustomerId(),
                invoice.getTotalAmount(),
                invoice.getPaymentMethod(),
                invoice.getPaymentStatus(),
                invoice.getTicketID(),
                invoice.getCustomerID()
        );
    }

    // ==========================
    // Mapper DTO -> Entity
    // ==========================
    public Invoice toEntity(InvoiceDto dto) {
        return new Invoice(
                dto.getInvoiceId(),
                dto.getCustomerId(),
                dto.getTotalAmount(),
                dto.getPaymentMethod(),
                dto.getPaymentStatus(),
                dto.getTicketID(),
                dto.getCustomerID()
        );
    }

    // ==========================
    // CRUD Methods trực tiếp
    // ==========================

    public List<InvoiceDto> getAllInvoices() {
        return invoiceService.getAllInvoices()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public InvoiceDto getInvoiceById(int id) {
        return invoiceService.getInvoiceById(id)
                .map(this::toDTO)
                .orElse(null); // trả về null nếu không tìm thấy
    }

    public InvoiceDto createInvoice(InvoiceDto dto) {
        Invoice saved = invoiceService.saveInvoice(toEntity(dto));
        return toDTO(saved);
    }

    public InvoiceDto updateInvoice(int id, InvoiceDto dto) {
        dto.setInvoiceId(id);
        Invoice updated = invoiceService.saveInvoice(toEntity(dto));
        return toDTO(updated);
    }

    public boolean deleteInvoice(int id) {
        if (invoiceService.getInvoiceById(id).isPresent()) {
            invoiceService.deleteInvoice(id);
            return true;
        }
        return false; // trả về false nếu ID không tồn tại
    }
}
