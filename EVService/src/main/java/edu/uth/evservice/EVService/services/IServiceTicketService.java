package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
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

    // Phuong thuc xu li cham cong cho technician
    ServiceTicketDto startWorkOnTicket(Integer ticketId, String username);

    ServiceTicketDto completeWorkOnTicket(Integer ticketId, String username);

    List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId);

    // Xac nhan ticket
    void verifyTicketOwnership(Integer ticketId, String username);
}