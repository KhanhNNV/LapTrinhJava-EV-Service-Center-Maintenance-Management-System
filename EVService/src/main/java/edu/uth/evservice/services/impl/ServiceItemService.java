package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.models.ServiceItem;
import edu.uth.evservice.repositories.IServiceItemRepository;
import edu.uth.evservice.requests.CreateServiceItemRequest;
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
    public ServiceItemDto createServiceItem(CreateServiceItemRequest request) {
        ServiceItem item = new ServiceItem();
        item.setItemName(request.getItemName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());

        ServiceItem saved = serviceItemRepository.save(item);
        return toDto(saved);
    }

    @Override
    public ServiceItemDto updateServiceItem(Integer id, CreateServiceItemRequest request) {
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
