package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;

public interface IServiceItemPartService {
    List<ServiceItemPartDto> getByServiceItem(Integer serviceItemId);

    ServiceItemPartDto add(ServiceItemPartRequest request);

    void deleteServiceItemPart(Integer itemId, Integer partId);
}
