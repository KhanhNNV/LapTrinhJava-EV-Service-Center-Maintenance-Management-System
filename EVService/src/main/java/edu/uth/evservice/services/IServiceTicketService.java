package edu.uth.evservice.services;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import edu.uth.evservice.dtos.*;
import edu.uth.evservice.models.enums.ServiceTicketStatus;
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
    ServiceTicketDto createTicketFromAppointment(Integer appointmentId, Integer technicianId);

    ServiceTicketDto completeWorkOnTicket(Integer ticketId, Integer technicianId);

    void verifyTicketOwnership(Integer technicianId, Integer ticketId);

    List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId);

    // Optimized update methods
    ServiceTicketDto updateTicketStatus(Integer ticketId, Integer technicianId, ServiceTicketStatus newStatus);

    ServiceTicketDto updateTicketNotes(Integer ticketId, Integer technicianId, String newNotes);
    // --- BÁO CÁO HIỆU SUẤT KỸ THUẬT VIÊN ---
    public List<PerformanceDto> calculatePerformance(LocalDate start, LocalDate end);

    // Thêm item và part vào ticket

    SuggestedPartsDto addServiceItemToTicket(Integer ticketId, AddServiceItemRequest request, Integer technicianId);

    void removeServiceItemFromTicket(Integer ticketId, Integer itemId, Integer technicianId);

    TicketPartDto updatePartOnTicket(Integer ticketId, UpdatePartQuantityRequest request, Integer technicianId);

}