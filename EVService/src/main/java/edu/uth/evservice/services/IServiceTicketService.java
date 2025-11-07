package edu.uth.evservice.services;

import java.time.LocalDateTime;
import java.util.List;

import edu.uth.evservice.dtos.ServiceTicketDto;
import edu.uth.evservice.dtos.SuggestedPartsDto;
import edu.uth.evservice.dtos.TechnicianPerformanceDto;
import edu.uth.evservice.dtos.TicketPartDto;
import edu.uth.evservice.models.ServiceTicket;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
import edu.uth.evservice.requests.AddPartRequest;
import edu.uth.evservice.requests.AddServiceItemRequest;
import edu.uth.evservice.requests.ServiceTicketRequest;
import edu.uth.evservice.requests.UpdatePartQuantityRequest;

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


    // Thêm item và part vào ticket

    SuggestedPartsDto addServiceItemToTicket(Integer ticketId, AddServiceItemRequest request, String username);

    void removeServiceItemFromTicket(Integer ticketId, Integer itemId, String username);

    TicketPartDto updatePartOnTicket(Integer ticketId, UpdatePartQuantityRequest request, String username);

}