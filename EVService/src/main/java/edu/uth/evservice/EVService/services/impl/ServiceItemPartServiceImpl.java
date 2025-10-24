package edu.uth.evservice.EVService.services.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.model.Part;
import edu.uth.evservice.EVService.model.ServiceItem;
import edu.uth.evservice.EVService.model.ServiceItemPart;
import edu.uth.evservice.EVService.model.ServiceItemPartId;
import edu.uth.evservice.EVService.repositories.IPartRepository;
import edu.uth.evservice.EVService.repositories.IServiceItemPartRepository;
import edu.uth.evservice.EVService.repositories.IServiceItemRepository;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;
import edu.uth.evservice.EVService.services.IServiceItemPartService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceItemPartServiceImpl implements IServiceItemPartService {

    private final IServiceItemPartRepository repository;
    private final IServiceItemRepository serviceItemRepository;
    private final IPartRepository partRepository;
    private final IServiceItemPartRepository serviceItemPartRepository;

    @Override
    public List<ServiceItemPartDto> getByServiceItem(Integer serviceItemId) {
        return repository.findByServiceItem_ItemId(serviceItemId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public ServiceItemPartDto add(ServiceItemPartRequest request) {
        ServiceItem serviceItem = serviceItemRepository.findById(request.getServiceItemId())
                .orElseThrow(() -> new RuntimeException("Service item not found"));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found"));

        ServiceItemPart sip = ServiceItemPart.builder()
                .serviceItem(serviceItem)
                .part(part)
                .quantity(request.getQuantity())
                .build();

        return mapToDTO(repository.save(sip));
    }

    @Override
    public void deleteServiceItemPart(Integer itemId, Integer partId) {
        if (itemId == null || partId == null) {
            throw new IllegalArgumentException("Item ID and Part ID cannot be null");
        }
        ServiceItemPartId id = new ServiceItemPartId(itemId, partId);
        serviceItemPartRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ServiceItemPart not found with itemId: " + itemId + " and partId: " + partId));
        serviceItemPartRepository.deleteById(id);
    }

    private ServiceItemPartDto mapToDTO(ServiceItemPart sip) {
        return ServiceItemPartDto.builder()
                .serviceItemId(sip.getServiceItem().getItemId())
                .partId(sip.getPart().getPartId())
                .quantity(sip.getQuantity())
                .build();
    }
}
