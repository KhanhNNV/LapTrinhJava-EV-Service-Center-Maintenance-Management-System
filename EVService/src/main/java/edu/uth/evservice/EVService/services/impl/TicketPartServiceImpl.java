package edu.uth.evservice.EVService.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.TicketPartDto;
import edu.uth.evservice.EVService.model.Part;
import edu.uth.evservice.EVService.model.ServiceTicket;
import edu.uth.evservice.EVService.model.TicketPart;
import edu.uth.evservice.EVService.model.TicketPartId;
import edu.uth.evservice.EVService.repositories.ITicketPartRepository;
import edu.uth.evservice.EVService.repositories.IPartRepository;
import edu.uth.evservice.EVService.repositories.IServiceTicketRepository;
import edu.uth.evservice.EVService.requests.TicketPartRequest;
import edu.uth.evservice.EVService.services.ITicketPartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@AllArgsConstructor
public class TicketPartServiceImpl implements ITicketPartService {
    private final ITicketPartRepository ticketPartRepository;
    private final IPartRepository partRepository;
    private final IServiceTicketRepository serviceTicketRepository;

    @Override
    public List<TicketPartDto> getAllTicketParts() {
        return ticketPartRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TicketPartDto getTicketPartById(Integer ticketId, Integer partId) {
        if (ticketId == null || partId == null) {
            throw new IllegalArgumentException("Ticket ID and Part ID cannot be null");
        }
        TicketPartId id = new TicketPartId(ticketId, partId);
        return ticketPartRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException(
                        "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
    }

    @Override
    public TicketPartDto createTicketPart(TicketPartRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("TicketPart request cannot be null");
        }

        ServiceTicket ticket = serviceTicketRepository.findById(request.getTicketId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Service ticket not found with id: " + request.getTicketId()));
        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new EntityNotFoundException("Part not found with id: " + request.getPartId()));

        TicketPart ticketPart = new TicketPart();
        ticketPart.setTicket(ticket);
        ticketPart.setPart(part);
        ticketPart.setQuantity(request.getQuantity());
        ticketPart.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());

        TicketPart saved = ticketPartRepository.save(ticketPart);
        return toDto(saved);
    }

    @Override
    public TicketPartDto updateTicketPart(Integer ticketId, Integer partId, TicketPartRequest request) {
        if (ticketId == null || partId == null || request == null) {
            throw new IllegalArgumentException("Ticket ID, Part ID, and ticketPart request cannot be null");
        }

        TicketPartId id = new TicketPartId(ticketId, partId);
        return ticketPartRepository.findById(id).map(existing -> {
            existing.setQuantity(request.getQuantity());
            existing.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());
            TicketPart updated = ticketPartRepository.save(existing);
            return toDto(updated);
        }).orElseThrow(() -> new EntityNotFoundException(
                "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
    }

    @Override
    public void deleteTicketPart(Integer ticketId, Integer partId) {
        if (ticketId == null || partId == null) {
            throw new IllegalArgumentException("Ticket ID and Part ID cannot be null");
        }
        TicketPartId id = new TicketPartId(ticketId, partId);
        ticketPartRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
        ticketPartRepository.deleteById(id);
    }

    @Override
    public List<TicketPartDto> getTicketPartsByTicketId(Integer ticketId) {
        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }
        return ticketPartRepository.findByTicketId(ticketId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TicketPartDto> getTicketPartsByPartId(Integer partId) {
        if (partId == null) {
            throw new IllegalArgumentException("Part ID cannot be null");
        }
        return ticketPartRepository.findByPartId(partId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TicketPartDto toDto(TicketPart ticketPart) {
        if (ticketPart == null) {
            return null;
        }
        return new TicketPartDto(
                ticketPart.getTicket() != null ? ticketPart.getTicket().getTicket_id() : null,
                ticketPart.getPart() != null ? ticketPart.getPart().getPartId() : null,
                ticketPart.getQuantity(),
                ticketPart.getUnitPriceAtTimeOfService());
    }
}