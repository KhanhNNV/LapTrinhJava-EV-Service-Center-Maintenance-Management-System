//package edu.uth.evservice.services.impl;
//
//import java.util.List;
//import java.util.stream.Collectors;
//
//import edu.uth.evservice.exception.ResourceNotFoundException;
//import org.springframework.stereotype.Service;
//
//import edu.uth.evservice.dtos.TicketPartDto;
//import edu.uth.evservice.models.Part;
//import edu.uth.evservice.models.ServiceTicket;
//import edu.uth.evservice.models.TicketPart;
//import edu.uth.evservice.models.TicketPartId;
//import edu.uth.evservice.repositories.ITicketPartRepository;
//import edu.uth.evservice.repositories.IPartRepository;
//import edu.uth.evservice.repositories.IServiceTicketRepository;
//import edu.uth.evservice.requests.TicketPartRequest;
//import edu.uth.evservice.services.ITicketPartService;
//import lombok.AccessLevel;
//import lombok.AllArgsConstructor;
//import lombok.experimental.FieldDefaults;
//
//@Service
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//@AllArgsConstructor
//public class TicketPartServiceImpl implements ITicketPartService {
//    private final ITicketPartRepository ticketPartRepository;
//    private final IPartRepository partRepository;
//    private final IServiceTicketRepository serviceTicketRepository;
//
//    @Override
//    public List<TicketPartDto> getAllTicketParts() {
//        return ticketPartRepository.findAll().stream()
//                .map(this::toDto)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public TicketPartDto getTicketPartById(Integer ticketId, Integer partId) {
//        if (ticketId == null || partId == null) {
//            throw new IllegalArgumentException("Ticket ID and Part ID cannot be null");
//        }
//        TicketPartId id = new TicketPartId(ticketId, partId);
//        return ticketPartRepository.findById(id)
//                .map(this::toDto)
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
//    }
//
//    @Override
//    public TicketPartDto createTicketPart(TicketPartRequest request) {
//        if (request == null) {
//            throw new IllegalArgumentException("TicketPart request cannot be null");
//        }
//        if (request.getQuantity() == null || request.getQuantity() <= 0) {
//            throw new IllegalArgumentException("Quantity must be greater than 0");
//        }
//
//        ServiceTicket ticket = serviceTicketRepository.findById(request.getTicketId())
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "Service ticket not found with id: " + request.getTicketId()));
//        Part part = partRepository.findById(request.getPartId())
//                .orElseThrow(() -> new ResourceNotFoundException("Part not found with id: " + request.getPartId()));
//
//        TicketPart ticketPart = new TicketPart();
//        ticketPart.setTicket(ticket);
//        ticketPart.setPart(part);
//        ticketPart.setQuantity(request.getQuantity());
//        ticketPart.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());
//
//        TicketPart saved = ticketPartRepository.save(ticketPart);
//        return toDto(saved);
//    }
//
//    @Override
//    public TicketPartDto updateTicketPart(Integer ticketId, Integer partId, TicketPartRequest request) {
//        if (ticketId == null || partId == null || request == null) {
//            throw new IllegalArgumentException("Ticket ID, Part ID, and ticketPart request cannot be null");
//        }
//
//        TicketPartId id = new TicketPartId(ticketId, partId);
//        return ticketPartRepository.findById(id).map(existing -> {
//            existing.setQuantity(request.getQuantity());
//            existing.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());
//            TicketPart updated = ticketPartRepository.save(existing);
//            return toDto(updated);
//        }).orElseThrow(() -> new ResourceNotFoundException(
//                "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
//    }
//
//    @Override
//    public void deleteTicketPart(Integer ticketId, Integer partId) {
//        if (ticketId == null || partId == null) {
//            throw new IllegalArgumentException("Ticket ID and Part ID cannot be null");
//        }
//        TicketPartId id = new TicketPartId(ticketId, partId);
//        ticketPartRepository.findById(id)
//                .orElseThrow(() -> new ResourceNotFoundException(
//                        "TicketPart not found with ticketId: " + ticketId + " and partId: " + partId));
//        ticketPartRepository.deleteById(id);
//    }
//
//    @Override
//    public List<TicketPartDto> getTicketPartsByTicketId(Integer ticketId) {
//        if (ticketId == null) {
//            throw new IllegalArgumentException("Ticket ID cannot be null");
//        }
//        return ticketPartRepository.findByTicket_TicketId(ticketId).stream()
//                .map(this::toDto)
//                .collect(Collectors.toList());
//    }
//
//    @Override
//    public List<TicketPartDto> getTicketPartsByPartId(Integer partId) {
//        if (partId == null) {
//            throw new IllegalArgumentException("Part ID cannot be null");
//        }
//        return ticketPartRepository.findByPart_PartId(partId).stream()
//                .map(this::toDto)
//                .collect(Collectors.toList());
//    }
//
//    private TicketPartDto toDto(TicketPart ticketPart) {
//        if (ticketPart == null) {
//            return null;
//        }
//        return new TicketPartDto(
//                ticketPart.getTicket() != null ? ticketPart.getTicket().getTicketId() : null,
//                ticketPart.getPart() != null ? ticketPart.getPart().getPartId() : null,
//                ticketPart.getQuantity(),
//                ticketPart.getUnitPriceAtTimeOfService());
//    }
//}