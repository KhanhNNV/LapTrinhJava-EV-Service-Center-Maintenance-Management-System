package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.model.Part;
import edu.uth.evservice.EVService.model.ServiceItem;
import edu.uth.evservice.EVService.model.ServiceItemPart;
import edu.uth.evservice.EVService.repositories.IServiceItemRepository;
import edu.uth.evservice.EVService.repositories.PartRepository;
import edu.uth.evservice.EVService.repositories.ServiceItemPartRepository;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;
import edu.uth.evservice.EVService.services.IServiceItemPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceItemPartServiceImpl implements IServiceItemPartService {

    private final ServiceItemPartRepository repository;
    private final IServiceItemRepository serviceItemRepository;
    private final PartRepository partRepository;

    @Override
    public List<ServiceItemPartDto> getByServiceItem(Long serviceItemId) {
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
    public void delete(Long id) {
        repository.deleteById(id);
    }

    private ServiceItemPartDto mapToDTO(ServiceItemPart sip) {
        return ServiceItemPartDto.builder()
                .id(sip.getId())
                .serviceItemId(sip.getServiceItem().getItemId())
                .partId(sip.getPart().getPartId())
                .quantity(sip.getQuantity())
                .build();
    }
}
