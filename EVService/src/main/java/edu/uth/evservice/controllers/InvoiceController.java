package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.InvoiceDto;
import edu.uth.evservice.services.billing.IInvoiceService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
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

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<InvoiceDto>> getAllInvoices(Authentication authentication) {
        return ResponseEntity.ok().body(invoiceService.getAllInvoices());
    }

    // staff tạo hóa đơn đã completed
    @PostMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public ResponseEntity<InvoiceDto> createInvoice(@PathVariable Integer ticketId, Authentication authentication){
        Integer staffId = Integer.parseInt(authentication.getName());
        InvoiceDto invoiceDto = invoiceService.createInvoiceForTicket(ticketId, staffId);
        return new ResponseEntity<>(invoiceDto, HttpStatus.OK);
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN', 'CUSTOMER')")
    public ResponseEntity<InvoiceDto> getInvoiceByTicketId(
            @PathVariable Integer ticketId) {

        InvoiceDto invoice = invoiceService.getInvoiceByTicketId(ticketId);
        return ResponseEntity.ok(invoice);
    }

    @GetMapping("/my-invoices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<InvoiceDto>> getMyInvoices(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int limit // Mặc định lấy 100 cái mới nhất
    ) {
        Integer userId = Integer.parseInt(authentication.getName());
        Page<InvoiceDto> invoices = invoiceService.getMyInvoices(userId, page, limit);
        return ResponseEntity.ok(invoices);
    }

    @PutMapping("/{invoiceId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<InvoiceDto> updatePaymentStatus(
            @PathVariable Integer invoiceId,
            @RequestParam String status) {

        InvoiceDto updatedInvoiceDto = invoiceService.updatePaymentStatus(invoiceId, status);

        return ResponseEntity.ok(updatedInvoiceDto);
    }
}
