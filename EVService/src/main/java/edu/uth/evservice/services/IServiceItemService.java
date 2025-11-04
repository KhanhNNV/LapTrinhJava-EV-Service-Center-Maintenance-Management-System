package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.requests.CreateServiceItemRequest;

import java.util.List;

public interface IServiceItemService {
    List<ServiceItemDto> getAllServiceItems();
    ServiceItemDto getServiceItemById(Integer id);
    ServiceItemDto createServiceItem(CreateServiceItemRequest request);
    ServiceItemDto updateServiceItem(Integer id, CreateServiceItemRequest request);
    void deleteServiceItem(Integer id);
}
