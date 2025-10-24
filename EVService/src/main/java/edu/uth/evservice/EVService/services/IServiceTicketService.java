package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;

import java.math.BigDecimal;
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
    List<ServiceTicketDto> getTicketsByStatus(String status);
    BigDecimal calculateTotalAmount(Integer ticketId);//phương thức này hứa sẽ trả về một con số tiền tệ chính xác

}