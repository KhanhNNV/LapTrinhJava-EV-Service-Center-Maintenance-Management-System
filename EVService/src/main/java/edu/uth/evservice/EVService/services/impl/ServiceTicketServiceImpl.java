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
import edu.uth.evservice.EVService.model.enums.AppointmentStatus;
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
                .status(ServiceTicketStatus.valueOf(request.getStatus()))
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
        ticket.setStatus(ServiceTicketStatus.valueOf(request.getStatus()));
        ticket.setNotes(request.getNotes());

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void deleteTicket(Integer id) {
        ticketRepo.deleteById(id);
    }

    // --- LOGIC MỚI CHO WORKFLOW ---

    @Override
    public ServiceTicketDto createTicketFromAppointment(Integer appointmentId, String technicianUsername) {
        Appointment appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found: " + appointmentId));

        if (appointment.getStatus() != AppointmentStatus.CHECKED_IN) {
            throw new IllegalStateException("Cannot create service ticket. Customer has not checked in yet.");
        }
        if (appointment.getServiceTickets() != null) {
            throw new IllegalStateException("A service ticket has already been created for this appointment.");
        }
        if (!appointment.getAssignedTechnician().getUsername().equals(technicianUsername)) {
            throw new SecurityException("You are not assigned to this appointment.");
        }

        ServiceTicket ticket = ServiceTicket.builder()
                .appointment(appointment)
                .technician(appointment.getAssignedTechnician())
                .startTime(LocalDateTime.now())
                .status(ServiceTicketStatus.IN_PROGRESS)
                .notes(appointment.getNote())
                .build();

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto completeWorkOnTicket(Integer ticketId, String username) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));

        if (ticket.getEndTime() != null) {
            throw new IllegalStateException("Work on this ticket has already been completed.");
        }

        ticket.setEndTime(LocalDateTime.now());
        ticket.setStatus(ServiceTicketStatus.COMPLETED);

        // Cập nhật cả Appointment liên quan
        ticket.getAppointment().setStatus(AppointmentStatus.COMPLETED);

        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public void verifyTicketOwnership(String username, Integer ticketId) {
        User technician = userRepo.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found: " + username));
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found: " + ticketId));

        if (!ticket.getTechnician().getUserId().equals(technician.getUserId())) {
            throw new SecurityException("Access Denied: You do not own this service ticket.");
        }
    }

    @Override
    public List<ServiceTicketDto> getTicketsByTechnicianId(Integer technicianId) {
        return ticketRepo.findByTechnician_UserId(technicianId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ServiceTicketDto updateTicketStatus(Integer ticketId, String username, ServiceTicketStatus newStatus) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));
        ticket.setStatus(newStatus);
        return toDto(ticketRepo.save(ticket));
    }

    @Override
    public ServiceTicketDto updateTicketNotes(Integer ticketId, String username, String newNotes) {
        verifyTicketOwnership(username, ticketId);
        ServiceTicket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Service Ticket not found"));
        ticket.setNotes(newNotes);
        return toDto(ticketRepo.save(ticket));
    }

    private ServiceTicketDto toDto(ServiceTicket ticket) {
        if (ticket == null)
            return null;
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
