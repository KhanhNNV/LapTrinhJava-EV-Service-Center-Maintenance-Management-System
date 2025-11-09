package edu.uth.evservice.controllers;

import java.util.List;

import edu.uth.evservice.dtos.SuggestedPartsDto;
import edu.uth.evservice.dtos.TicketPartDto;
import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.TicketPartRequest;
import edu.uth.evservice.requests.UpdatePartQuantityRequest;
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
import org.springframework.web.bind.annotation.RestController;

import edu.uth.evservice.dtos.ServiceTicketDto;
import edu.uth.evservice.dtos.TechnicianPerformanceDto;
import edu.uth.evservice.requests.ServiceTicketRequest;
import edu.uth.evservice.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;


@RestController
@RequestMapping("/api/service-tickets")
@RequiredArgsConstructor
public class ServiceTicketController {

    private final IServiceTicketService ticketService;

    // Báo cáo hiệu suất làm việc của technician
    @GetMapping("/performance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TechnicianPerformanceDto>> getTechnicianPerformance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        // Kiểm tra tính hợp lệ của thời gian
        if (endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<TechnicianPerformanceDto> report =
                ticketService.calculateTechnicianPerformance(startDate, endDate);
        return ResponseEntity.ok(report);

    }

    // Tao service ticket tu appointment cua technician
    @PostMapping("/technician/{appointmentId}/create-service-ticket")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> createServiceTicket(
            @PathVariable Integer appointmentId,
            Authentication authentication) {

        ServiceTicketDto newTicket = ticketService.createTicketFromAppointment(appointmentId, authentication.getName());
        return new ResponseEntity<>(newTicket, HttpStatus.CREATED);
    }

    // cap nhat trang thai service ticket khi hoan thanh cong viec
    @PutMapping("/technician/{ticketId}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ServiceTicketDto> completeWork(@PathVariable Integer ticketId,
            Authentication authentication) {
        ServiceTicketDto updatedTicket = ticketService.completeWorkOnTicket(ticketId, authentication.getName());
        return ResponseEntity.ok(updatedTicket);
    }

    /**
     * Tech thêm một ServiceItem vào Ticket.
     * Trả về chi tiết dịch vụ vừa thêm VÀ danh sách phụ tùng được gợi ý (bảng serviceItemPart).
     */
    @PostMapping("/{ticketId}/service-items")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<SuggestedPartsDto> addServiceItemtoTicket(
            @PathVariable Integer ticketId,
            @RequestBody AddServiceItemRequest request,
            Authentication authentication) {

        SuggestedPartsDto response = ticketService.addServiceItemToTicket(ticketId,request,authentication.getName());
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

        ticketService.removeServiceItemFromTicket(ticketId, itemId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Tech cập nhập số lượng(nếu ko lấy số lượng từ gợi ý khi thêm item) (Thêm/Sửa/Xóa) của một phụ tùng trên Ticket.
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

        TicketPartDto updatedPart = ticketService.updatePartOnTicket(
                ticketId,
                request,
                authentication.getName());

        return ResponseEntity.ok(updatedPart);
    }


}
