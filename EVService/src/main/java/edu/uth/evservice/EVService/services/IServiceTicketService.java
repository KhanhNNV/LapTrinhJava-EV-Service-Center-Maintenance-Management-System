package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;

import java.util.List;

/**
 * Interface định nghĩa business actions cho ServiceTicket
 */
public interface IServiceTicketService {
    List<ServiceTicketDto> getAllTickets();
    ServiceTicketDto getTicketById(int id);
    ServiceTicketDto createTicket(ServiceTicketRequest request);
    ServiceTicketDto updateTicket(int id, ServiceTicketRequest request);
    void deleteTicket(int id);
}