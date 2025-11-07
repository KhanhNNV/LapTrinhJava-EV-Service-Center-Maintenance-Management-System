//package edu.uth.evservice.controllers;
//
//import edu.uth.evservice.dtos.InvoiceDto;
//import edu.uth.evservice.requests.CreateInvoiceRequest;
//import edu.uth.evservice.services.IInvoiceService;
//import lombok.*;
//import lombok.experimental.FieldDefaults;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/invoices")
//@AllArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//public class InvoiceController {
//    IInvoiceService invoiceService;
//
//    @GetMapping
//    public List<InvoiceDto> getInvoices() {
//        return invoiceService.getAllInvoices();
//    }
//
//    @GetMapping("/{id}")
//    public InvoiceDto getInvoiceById(@PathVariable Integer id) {
//        return invoiceService.getInvoiceById(id);
//    }
//
//    @PostMapping
//    public InvoiceDto createInvoice(@RequestBody CreateInvoiceRequest request) {
//        return invoiceService.createInvoice(request);
//    }
//
//    @PutMapping("/{id}")
//    public InvoiceDto updateInvoice(@PathVariable Integer id, @RequestBody CreateInvoiceRequest request) {
//        return invoiceService.updateInvoice(id, request);
//    }
//
//    @DeleteMapping("/{id}")
//    public void deleteInvoice(@PathVariable Integer id) {
//        invoiceService.deleteInvoice(id);
//    }
//}
