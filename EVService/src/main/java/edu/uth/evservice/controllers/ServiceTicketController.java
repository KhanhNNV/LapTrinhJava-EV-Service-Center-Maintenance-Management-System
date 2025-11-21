package edu.uth.evservice.controllers;

import java.time.LocalDate;
import java.util.List;

import edu.uth.evservice.dtos.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.UpdatePartQuantityRequest;
import edu.uth.evservice.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final IServiceTicketService ticketService;
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ServiceTicketDto> getAllServiceTickets() {
        return ticketService.getAllTickets();
    }

    // Báo cáo hiệu suất làm việc của technician
    @GetMapping("/performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PerformanceDto>> getPerformance(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {

        List<PerformanceDto> report = ticketService.calculatePerformance(start, end);
        return ResponseEntity.ok(report);
    }
    // lấy toàn bộ ticket của appointment
    @GetMapping("/technician")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<List<ServiceTicketDto>> getByTechnician(Authentication authentication) {
        Integer technicianId = Integer.parseInt(authentication.getName());
        List<ServiceTicketDto> serviceTicket= ticketService.getTicketsByTechnicianId(technicianId);
        return ResponseEntity.ok(serviceTicket);
    }


    // Tao service ticket tu appointment cua technician
    @PostMapping("/technician/{appointmentId}/create-service-ticket")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> createServiceTicket(
            @PathVariable Integer appointmentId,
            Authentication authentication) {

        Integer technicianId = Integer.parseInt(authentication.getName());
        ServiceTicketDto newTicket = ticketService.createTicketFromAppointment(appointmentId, technicianId);
        return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
    }

    // cap nhat trang thai service ticket khi hoan thanh cong viec
    @PutMapping("/technician/{ticketId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> completeWork(@PathVariable Integer ticketId,
            Authentication authentication) {

        Integer technicianId = Integer.parseInt(authentication.getName());
        ServiceTicketDto updatedTicket = ticketService.completeWorkOnTicket(ticketId, technicianId);
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Tech thêm một ServiceItem vào Ticket.
     * Trả về chi tiết dịch vụ vừa thêm VÀ danh sách phụ tùng được gợi ý (bảng
     * serviceItemPart).
     */
    @PostMapping("/{ticketId}/service-items")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<SuggestedPartsDto> addServiceItemtoTicket(
            @PathVariable Integer ticketId,
            @RequestBody AddServiceItemRequest request,
            Authentication authentication) {

        Integer technicianId = Integer.parseInt(authentication.getName());
        SuggestedPartsDto response = ticketService.addServiceItemToTicket(ticketId, request, technicianId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Tech xóa một ServiceItem khỏi Ticket.
     */
    @DeleteMapping("/{ticketId}/service-items/{itemId}")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<Void> removeServiceItemFromTicket(
            @PathVariable Integer ticketId,
            @PathVariable Integer itemId,
            Authentication authentication) {

        Integer technicianId = Integer.parseInt(authentication.getName());
        ticketService.removeServiceItemFromTicket(ticketId, itemId, technicianId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tech cập nhập số lượng(nếu ko lấy số lượng từ gợi ý khi thêm item)
     * (Thêm/Sửa/Xóa) của một phụ tùng trên Ticket.
     * - Thêm mới: quantity > 0 (khi chưa có)
     * - Sửa: quantity > 0 (khi đã có)
     * - Xóa: quantity = 0
     */
    @PutMapping("/{ticketId}/parts")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TicketPartDto> updatePartOnTicket(
            @PathVariable Integer ticketId,
            @RequestBody UpdatePartQuantityRequest request, // Dùng DTO mới
            Authentication authentication) {

        Integer technicianId = Integer.parseInt(authentication.getName());
        TicketPartDto updatedPart = ticketService.updatePartOnTicket(
                ticketId,
                request,
                technicianId);

        return ResponseEntity.ok(updatedPart);
    }

}
