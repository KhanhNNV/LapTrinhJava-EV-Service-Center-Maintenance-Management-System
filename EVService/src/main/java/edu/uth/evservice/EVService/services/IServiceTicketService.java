package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;

import java.util.List;

/**
 * Interface định nghĩa business actions cho ServiceTicket
 */
public interface IServiceTicketService {
    List<ServiceTicketDto> getAllTickets();
    ServiceTicketDto getTicketById(Integer id);
    ServiceTicketDto createTicket(ServiceTicketRequest request);
    ServiceTicketDto updateTicket(Integer id, ServiceTicketRequest request);
    void deleteTicket(Integer id);
}