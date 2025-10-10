package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServiceItemDto;
import edu.uth.evservice.EVService.requests.CreateServiceItemRequest;

import java.util.List;

public interface IServiceItemService {
    List<ServiceItemDto> getAllServiceItems();
    ServiceItemDto getServiceItemById(Integer id);
    ServiceItemDto createServiceItem(CreateServiceItemRequest request);
    ServiceItemDto updateServiceItem(Integer id, CreateServiceItemRequest request);
    void deleteServiceItem(Integer id);
}
