package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.exception.ResourceNotFoundException;
import edu.uth.evservice.models.Part;
import edu.uth.evservice.models.ServiceItem;
import edu.uth.evservice.models.ServiceItemPart;
import edu.uth.evservice.models.ServiceItemPartId;
import edu.uth.evservice.repositories.IPartRepository;
import edu.uth.evservice.repositories.IServiceItemPartRepository;
import edu.uth.evservice.repositories.IServiceItemRepository;
import edu.uth.evservice.requests.ServiceItemRequest;
import edu.uth.evservice.services.IServiceItemService;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServiceItemService implements IServiceItemService {

    IServiceItemRepository serviceItemRepository;
    IPartRepository partRepository;
    private final IServiceItemPartRepository suggestionRepo;

    @Override
    public ServiceItemDto addSuggestion(Integer itemId, Integer partId, int quantity) {
        ServiceItem item = serviceItemRepository.findById(itemId).orElseThrow(()-> new ResourceNotFoundException("Không tìm thấy hạng mục dịch vụ này")) ;

        Part part = partRepository.findById(partId).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phụ tùng này"));

        ServiceItemPart suggestion = ServiceItemPart.builder()
                .id(new ServiceItemPartId(itemId,partId))
                .serviceItem(item)
                .part(part)
                .quantity(quantity)
                .build();
        suggestionRepo.save(suggestion);
        return toDto(item);
    }

    @Override
    public void removeSuggestion(Integer itemId, Integer partId) {
        ServiceItemPartId id = new ServiceItemPartId(itemId, partId);
        if (!suggestionRepo.existsById(id)) {
            throw new ResourceNotFoundException("Gợi ý không tồn tại");
        }
        suggestionRepo.deleteById(id);
    }

    @Override
    public List<ServiceItemDto> getAllServiceItems() {
        return serviceItemRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceItemDto getServiceItemById(Integer id) {
        return serviceItemRepository.findById(id)
                .map(this::toDto)
                .orElse(null);
    }

    @Override
    public ServiceItemDto createServiceItem(ServiceItemRequest request) {
        ServiceItem item = new ServiceItem();
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());

        ServiceItem saved = serviceItemRepository.save(item);
        return toDto(saved);
    }

    @Override
    public ServiceItemDto updateServiceItem(Integer id, ServiceItemRequest request) {
        return serviceItemRepository.findById(id)
                .map(existing -> {
                    existing.setItemName(request.getItemName());
                    existing.setDescription(request.getDescription());
                    existing.setPrice(request.getPrice());
                    ServiceItem updated = serviceItemRepository.save(existing);
                    return toDto(updated);
                })
                .orElse(null);
    }

    @Override
    public void deleteServiceItem(Integer id) {
        serviceItemRepository.deleteById(id);
    }

    private ServiceItemDto toDto(ServiceItem item) {
        ServiceItemDto dto = new ServiceItemDto();
        dto.setId(item.getItemId());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        return dto;
    }
}
