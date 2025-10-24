package edu.uth.evservice.EVService.services.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.uth.evservice.EVService.dto.ServiceTicketDto;
import edu.uth.evservice.EVService.model.Appointment;
import edu.uth.evservice.EVService.model.ServiceTicket;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.model.enums.ServiceTicketStatus;
import edu.uth.evservice.EVService.repositories.IAppointmentRepository;
import edu.uth.evservice.EVService.repositories.IServiceTicketRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.ServiceTicketRequest;
import edu.uth.evservice.EVService.services.IServiceTicketService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceTicketServiceImpl implements IServiceTicketService {

    private final IServiceTicketRepository ticketRepo;
    private final IAppointmentRepository appointmentRepo;
    private final IUserRepository userRepo;

    @Override
    public List<ServiceTicketDto> getAllTickets() {
        return ticketRepo.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceTicketDto getTicketById(Integer id) {
        return ticketRepo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    @Override
    public ServiceTicketDto createTicket(ServiceTicketRequest request) {
        Appointment appointment = appointmentRepo.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        User technician = userRepo.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        ServiceTicket ticket = ServiceTicket.builder()
                .appointment(appointment)
                .technician(technician)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(ServiceTicketStatus.valueOf(request.getStatus().toUpperCase()))
                .notes(request.getNotes())
                .build();

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto updateTicket(Integer id, ServiceTicketRequest request) {
        ServiceTicket ticket = ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStartTime(request.getStartTime());
        ticket.setEndTime(request.getEndTime());
        ticket.setStatus(ServiceTicketStatus.valueOf(request.getStatus().toUpperCase()));
        ticket.setNotes(request.getNotes());

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void deleteTicket(Integer id) {
        ticketRepo.deleteById(id);
    }

    @Override
    public List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId) {
        return ticketRepo.findByTechnicianId(technicianId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void verifyTicketOwnership(Integer ticketId, String username) {
        User technician = userRepo.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found with username: " + username));

        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found with id: " + ticketId));

        if (!ticket.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new SecurityException("Access Denied: You do not have permission to modify this ticket.");
        }
    }

    @Override
    public ServiceTicketDto startWorkOnTicket(Integer ticketId, String username) {
        verifyTicketOwnership(ticketId, username);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found: " + ticketId));

        if (ticket.getStartTime() != null) {
            throw new IllegalStateException("Work on this ticket has already started.");
        }

        ticket.setStartTime(LocalDateTime.now());
        ticket.setStatus(ServiceTicketStatus.IN_PROGRESS);

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto completeWorkOnTicket(Integer ticketId, String username) {
        verifyTicketOwnership(ticketId, username);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found: " + ticketId));

        if (ticket.getStartTime() == null) {
            throw new IllegalStateException("Cannot complete a ticket that has not been started.");
        }
        if (ticket.getEndTime() != null) {
            throw new IllegalStateException("Work on this ticket has already been completed.");
        }

        ticket.setEndTime(LocalDateTime.now());
        ticket.setStatus(ServiceTicketStatus.COMPLETED);

        return toDto(ticketRepo.save(ticket));
    }

    private ServiceTicketDto toDto(ServiceTicket ticket) {
        return ServiceTicketDto.builder()
                .ticketId(ticket.getTicketId())
                .startTime(ticket.getStartTime())
                .endTime(ticket.getEndTime())
                .status(ticket.getStatus() != null ? ticket.getStatus().name() : null)
                .notes(ticket.getNotes())
                .appointmentId(ticket.getAppointment().getAppointmentId())
                .technicianId(ticket.getTechnician().getUserId())
                .build();
    }
}
