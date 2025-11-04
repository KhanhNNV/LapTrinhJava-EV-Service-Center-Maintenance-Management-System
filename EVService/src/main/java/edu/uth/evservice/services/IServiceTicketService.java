package edu.uth.evservice.services;

import java.time.LocalDateTime;
import java.util.List;

import edu.uth.evservice.dtos.ServiceTicketDto;
import edu.uth.evservice.dtos.TechnicianPerformanceDto;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.requests.ServiceTicketRequest;

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
    // --- BÁO CÁO HIỆU SUẤT KỸ THUẬT VIÊN ---
    List<TechnicianPerformanceDto> calculateTechnicianPerformance(LocalDateTime startDate, LocalDateTime endDate);

}