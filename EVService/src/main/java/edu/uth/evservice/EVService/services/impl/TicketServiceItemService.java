package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.TicketServiceItemDto;
import edu.uth.evservice.EVService.model.*;
import edu.uth.evservice.EVService.repositories.IServiceItemRepository;
import edu.uth.evservice.EVService.repositories.IServiceTicketRepository;
import edu.uth.evservice.EVService.repositories.ITicketServiceItemRepository;
import edu.uth.evservice.EVService.requests.CreateTicketServiceItemRequest;
import edu.uth.evservice.EVService.services.ITicketServiceItemService;
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
    // Bổ sung hai repository cần thiết để tìm đối tượng
    IServiceTicketRepository ticketRepository;
    IServiceItemRepository itemRepository;
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

//    @Override
//    public TicketServiceItemDto createTicketServiceItem(CreateTicketServiceItemRequest request) {
//        TicketServiceItem entity = new TicketServiceItem();
//        entity.setId(new TicketServiceItemId(request.getTicketId(), request.getItemId()));
//        entity.setQuantity(request.getQuantity());
//        entity.setUnitPriceAtTimeOfService(request.getUnitPriceAtTimeOfService());
//
//        TicketServiceItem saved = ticketServiceItemRepository.save(entity);
//        return toDto(saved);
//    }

@Override
public TicketServiceItemDto createTicketServiceItem(CreateTicketServiceItemRequest request) {
    // 1. Tìm đối tượng ServiceTicket thực tế
    ServiceTicket ticket = ticketRepository.findById(request.getTicketId())
            .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + request.getTicketId()));

    // 2. Tìm đối tượng ServiceItem thực tế
    ServiceItem item = itemRepository.findById(request.getItemId())
            .orElseThrow(() -> new RuntimeException("Service Item not found with id: " + request.getItemId()));

    // 3. Tạo bản ghi liên kết mới
    TicketServiceItem ticketServiceItem = new TicketServiceItem();

    // 4. Gán các đối tượng đầy đủ vào bản ghi
    ticketServiceItem.setServiceTicket(ticket);
    ticketServiceItem.setServiceItem(item);

    // Gán các thông tin khác
    ticketServiceItem.setQuantity(request.getQuantity());
    // Lấy giá từ đối tượng item để đảm bảo tính chính xác tại thời điểm thêm vào
    ticketServiceItem.setUnitPriceAtTimeOfService(item.getPrice());

    // 5. Gán ID phức hợp (đã sửa lỗi)
    ticketServiceItem.setId(new TicketServiceItemId(ticket.getTicketId(), item.getItemId()));

    // 6. Lưu vào database
    TicketServiceItem saved = ticketServiceItemRepository.save(ticketServiceItem);
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
        dto.setTicketId(entity.getId().getTicketId());
        dto.setItemId(entity.getId().getItemId());
        dto.setQuantity(entity.getQuantity());
        dto.setUnitPriceAtTimeOfService(entity.getUnitPriceAtTimeOfService());
        return dto;
    }
}
