package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.model.ServiceTicket;
import edu.uth.evservice.EVService.model.Appointment;
import edu.uth.evservice.EVService.model.employee.Employee;
import edu.uth.evservice.EVService.repositories.IServiceTicketRepository;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation của ServiceTicketService
 * - Dùng EntityManager.getReference(...) để tránh phải phụ thuộc vào repository của Appointment/Employee
 * - Lưu ý: getReference trả về proxy; nếu id không tồn tại, DB sẽ báo lỗi FK khi commit
 */
@Service
@RequiredArgsConstructor
public class ServiceTicketServiceImpl implements IServiceTicketService {

    private final IServiceTicketRepository ticketRepository;

    // Dùng EntityManager để lấy reference của Appointment/Employee (khỏi cần import repository của chúng)
    @PersistenceContext
    private final EntityManager em;

    @Override
    public List<ServiceTicketDto> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceTicketDto getTicketById(int id) {
        ServiceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ServiceTicket not found with id: " + id));
        return toDto(ticket);
    }

    @Override
    public ServiceTicketDto createTicket(ServiceTicketRequest request) {
        ServiceTicket ticket = new ServiceTicket();

        // Nếu client truyền startTime/endTime thì set
        ticket.setStartTime(request.getStartTime());
        ticket.setEndTime(request.getEndTime());
        ticket.setStatus(request.getStatus());
        ticket.setNotes(request.getNotes());

        // Lấy reference tới Appointment (không truy vấn đầy đủ)
        if (request.getAppointmentId() != null) {
            Appointment apptRef = em.getReference(Appointment.class, request.getAppointmentId());
            ticket.setAppointment(apptRef);
        } else {
            throw new RuntimeException("appointmentId is required to create a ServiceTicket");
        }

        // Lấy reference tới Employee (technician)
        if (request.getTechnicianId() != null) {
            Employee techRef = em.getReference(Employee.class, request.getTechnicianId());
            ticket.setTechnician(techRef);
        } else {
            throw new RuntimeException("technicianId is required to create a ServiceTicket");
        }

        ServiceTicket saved = ticketRepository.save(ticket);
        return toDto(saved);
    }

    @Override
    public ServiceTicketDto updateTicket(int id, ServiceTicketRequest request) {
        ServiceTicket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ServiceTicket not found with id: " + id));

        if (request.getStartTime() != null) ticket.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) ticket.setEndTime(request.getEndTime());
        if (request.getStatus() != null) ticket.setStatus(request.getStatus());
        if (request.getNotes() != null) ticket.setNotes(request.getNotes());

        if (request.getAppointmentId() != null) {
            Appointment apptRef = em.getReference(Appointment.class, request.getAppointmentId());
            ticket.setAppointment(apptRef);
        }
        if (request.getTechnicianId() != null) {
            Employee techRef = em.getReference(Employee.class, request.getTechnicianId());
            ticket.setTechnician(techRef);
        }

        ServiceTicket saved = ticketRepository.save(ticket);
        return toDto(saved);
    }

    @Override
    public void deleteTicket(int id) {
        if (!ticketRepository.existsById(id)) {
            throw new RuntimeException("ServiceTicket not found with id: " + id);
        }
        ticketRepository.deleteById(id);
    }

    // Chuyển Entity -> DTO (dùng khi trả API)
    private ServiceTicketDto toDto(ServiceTicket ticket) {
        Integer appointmentId = null;
        Integer technicianId = null;
        if (ticket.getAppointment() != null) {
            try { appointmentId = ticket.getAppointment().getAppointmentId(); } catch (Exception ignored) {}
        }
        if (ticket.getTechnician() != null) {
            try { technicianId = ticket.getTechnician().getEmployeeId(); } catch (Exception ignored) {}
        }

        return ServiceTicketDto.builder()
                .ticketId(ticket.getTicketId())
                .startTime(ticket.getStartTime())
                .endTime(ticket.getEndTime())
                .status(ticket.getStatus())
                .notes(ticket.getNotes())
                .appointmentId(appointmentId)
                .technicianId(technicianId)
                .build();
    }
}