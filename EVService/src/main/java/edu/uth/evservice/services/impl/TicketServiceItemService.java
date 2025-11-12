package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.TicketServiceItemDto;
import edu.uth.evservice.models.TicketServiceItem;
import edu.uth.evservice.models.TicketServiceItemId;
import edu.uth.evservice.repositories.ITicketServiceItemRepository;
import edu.uth.evservice.requests.CreateTicketServiceItemRequest;
import edu.uth.evservice.services.ITicketServiceItemService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketServiceItemService implements ITicketServiceItemService {

    ITicketServiceItemRepository ticketServiceItemRepository;

    @Override
    public List<TicketServiceItemDto> getAllTicketServiceItems() {
        return ticketServiceItemRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TicketServiceItemDto getTicketServiceItemById(Integer ticketId, Integer itemId) {
        TicketServiceItemId id = new TicketServiceItemId(ticketId, itemId);
        return ticketServiceItemRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public TicketServiceItemDto createTicketServiceItem(CreateTicketServiceItemRequest request) {
        TicketServiceItem entity = new TicketServiceItem();
        entity.setId(new TicketServiceItemId(request.getTicketId(), request.getItemId()));
        entity.setQuantity(request.getQuantity());
        entity.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());

        TicketServiceItem saved = ticketServiceItemRepository.save(entity);
        return toDto(saved);
    }

    @Override
    public TicketServiceItemDto updateTicketServiceItem(CreateTicketServiceItemRequest request) {
        TicketServiceItemId id = new TicketServiceItemId(request.getTicketId(), request.getItemId());
        return ticketServiceItemRepository.findById(id)
                .map(existing -> {
                    existing.setQuantity(request.getQuantity());
                    existing.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());
                    TicketServiceItem updated = ticketServiceItemRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteTicketServiceItem(Integer ticketId, Integer itemId) {
        TicketServiceItemId id = new TicketServiceItemId(ticketId, itemId);
        ticketServiceItemRepository.deleteById(id);
    }

    private TicketServiceItemDto toDto(TicketServiceItem entity) {
        TicketServiceItemDto dto = new TicketServiceItemDto();
        dto.setItemId(entity.getId().getItemId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPriceAtTimeOfService(entity.getUnitPriceAtTimeOfService());
        return dto;
    }
}
