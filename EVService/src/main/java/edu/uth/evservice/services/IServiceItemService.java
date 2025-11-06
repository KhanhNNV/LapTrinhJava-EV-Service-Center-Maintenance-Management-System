package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ServiceItemDto;
import edu.uth.evservice.requests.ServiceItemRequest;

import java.util.List;

public interface IServiceItemService {
    List<ServiceItemDto> getAllServiceItems();
    ServiceItemDto getServiceItemById(Integer id);
    ServiceItemDto createServiceItem(ServiceItemRequest request);
    ServiceItemDto updateServiceItem(Integer id, ServiceItemRequest request);

    ServiceItemDto addSuggestion(Integer itemId, Integer partId, int quantity);
    void removeSuggestion(Integer itemId, Integer partId);
}
