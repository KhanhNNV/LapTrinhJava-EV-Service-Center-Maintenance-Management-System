package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.services.IInvoiceService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InvoiceController {
    IInvoiceService invoiceService;

    // Tech tạo hóa đơn đã completed
    @PostMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoice(@PathVariable Integer ticketId, Authentication authentication){
        Integer technicianId = Integer.getInteger(authentication.getName());
        InvoiceDto invoiceDto = invoiceService.createInvoiceForTicket(ticketId, technicianId);
        return new ResponseEntity<>(invoiceDto, HttpStatus.OK);
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'CUSTOMER')")
    public ResponseEntity<InvoiceDto> getInvoiceByTicketId(
            @PathVariable Integer ticketId) {

        InvoiceDto invoice = invoiceService.getInvoiceByTicketId(ticketId);
        return ResponseEntity.ok(invoice);
    }

    @PutMapping("/{invoiceId}/status")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<InvoiceDto> updatePaymentStatus(
            @PathVariable Integer invoiceId,
            @RequestParam String status) {

        InvoiceDto updatedInvoiceDto = invoiceService.updatePaymentStatus(invoiceId, status);

        return ResponseEntity.ok(updatedInvoiceDto);
    }
}
