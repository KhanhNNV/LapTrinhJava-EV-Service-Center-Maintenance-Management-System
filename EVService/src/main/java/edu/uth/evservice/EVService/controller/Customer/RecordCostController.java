package edu.uth.evservice.EVService.controller.Customer;

import edu.uth.evservice.EVService.dto.CostSummaryResponseDto;
import edu.uth.evservice.EVService.dto.InvoiceDto;
import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.CreateInvoiceRequest;
import edu.uth.evservice.EVService.requests.PaymentConfirmationRequest;
import edu.uth.evservice.EVService.requests.PaymentRequest;
import edu.uth.evservice.EVService.services.IInvoiceService;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/customer/records-costs")
public class RecordCostController {

    @Autowired
    private IServiceTicketService ticketService;

    @Autowired
    private IInvoiceService invoiceService;

    // Cần bổ sung thêm thuộc tính ở ticketService và invoiceService

    /**
     * Lấy chi tiết phiếu dịch vụ (lịch sử bảo dưỡng) theo appointmentId
     */
    // @GetMapping("/appointments/{appointmentId}/maintenance-record")
    // public ResponseEntity<ServiceTicketDto> getMaintenanceRecord(@PathVariable int appointmentId) {
    //     ServiceTicketDto ticket = ticketService.getTicketByAppointmentId(appointmentId);
    //     return ResponseEntity.ok(ticket);
    // }

    // /**
    //  * Lấy hóa đơn chi phí cho một lần bảo dưỡng (theo appointmentId)
    //  */
    // @GetMapping("/appointments/{appointmentId}/invoice")
    // public ResponseEntity<InvoiceDto> getInvoiceForAppointment(@PathVariable int appointmentId) {
    //     InvoiceDto invoice = invoiceService.getInvoiceByAppointmentId(appointmentId);
    //     return ResponseEntity.ok(invoice);
    // }

    // /**
    //  * Lấy tổng hợp chi phí bảo dưỡng của một khách hàng
    //  */
    // @GetMapping("/customers/{customerId}/costs-summary")
    // public ResponseEntity<CostSummaryResponseDto> getCostsSummary(@PathVariable int customerId) {
    //     // LƯU Ý: Cần thêm logic để lấy Invoices theo CustomerId
    //     List<InvoiceDto> invoices = invoiceService.getInvoicesByCustomerId(customerId);

    //     double totalCost = invoices.stream().mapToDouble(InvoiceDto::getTotalAmount).sum();
    //     int totalServices = invoices.size();
    //     double averageCost = (totalServices > 0) ? totalCost / totalServices : 0.0;

    //     CostSummaryResponseDto summary = CostSummaryResponseDto.builder()
    //             .totalCost(totalCost)
    //             .totalServices(totalServices)
    //             .averageCost(averageCost)
    //             .build();
    //     return ResponseEntity.ok(summary);
    // }
    
    // /**
    //  * Lấy lịch sử thanh toán (hóa đơn) của khách hàng
    //  */
    // @GetMapping("/customers/{customerId}/payment-history")
    // public ResponseEntity<List<InvoiceDto>> getPaymentHistory(@PathVariable int customerId) {
    //     List<InvoiceDto> payments = invoiceService.getInvoicesByCustomerId(customerId);
    //     return ResponseEntity.ok(payments);
    // }

    // /**
    //  * Tạo một hóa đơn mới (yêu cầu thanh toán)
    //  */
    // @PostMapping("/payments")
    // public ResponseEntity<InvoiceDto> createPayment(@RequestBody PaymentRequest request) {
    //     // Lấy ticketId từ appointmentId
    //     ServiceTicketDto ticket = ticketService.getTicketByAppointmentId(request.getAppointmentId());

    //     CreateInvoiceRequest invoiceRequest = CreateInvoiceRequest.builder()
    //             .userId(request.getCustomerId())
    //             .ticketId(ticket.getTicketId())
    //             .invoiceDate(LocalDate.now())
    //             .totalAmount(request.getAmount())
    //             .paymentMethod(request.getPaymentMethod().toUpperCase())
    //             .paymentStatus("PENDING") // Mặc định khi tạo là chờ thanh toán
    //             .build();
        
    //     InvoiceDto createdInvoice = invoiceService.createInvoice(invoiceRequest);
    //     return ResponseEntity.ok(createdInvoice);
    // }

    // /**
    //  * Xác nhận/cập nhật trạng thái thanh toán
    //  */
    // @PostMapping("/payments/{invoiceId}/confirm")
    // public ResponseEntity<InvoiceDto> confirmPayment(
    //         @PathVariable int invoiceId,
    //         @RequestBody PaymentConfirmationRequest confirmation) {
    //     InvoiceDto updatedInvoice = invoiceService.updatePaymentStatus(invoiceId, confirmation.getStatus().toUpperCase());
    //     return ResponseEntity.ok(updatedInvoice);
    // }
}