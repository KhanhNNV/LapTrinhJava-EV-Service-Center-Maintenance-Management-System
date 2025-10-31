package edu.uth.evservice.EVService.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.dto.TechnicianPerformanceDto;
import edu.uth.evservice.EVService.model.enums.ServiceTicketStatus;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;

/**
 * Interface định nghĩa business actions cho ServiceTicket
 */
public interface IServiceTicketService {
    List<ServiceTicketDto> getAllTickets();

    ServiceTicketDto getTicketById(Integer id);

    ServiceTicketDto createTicket(ServiceTicketRequest request);

    ServiceTicketDto updateTicket(Integer id, ServiceTicketRequest request);

    void deleteTicket(Integer id);

    // --- LOGIC MỚI CHO WORKFLOW ---
    ServiceTicketDto createTicketFromAppointment(Integer appointmentId, String technicianUsername);

    ServiceTicketDto completeWorkOnTicket(Integer ticketId, String username);

    void verifyTicketOwnership(String username, Integer ticketId);

    List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId);

    // Optimized update methods
    ServiceTicketDto updateTicketStatus(Integer ticketId, String username, ServiceTicketStatus newStatus);

    ServiceTicketDto updateTicketNotes(Integer ticketId, String username, String newNotes);
    // --- Chức năng báo cáo hiệu suất kỹ thuật viên ---
    List<TechnicianPerformanceDto> calculateTechnicianPerformance(LocalDateTime startDate, LocalDateTime endDate);

}