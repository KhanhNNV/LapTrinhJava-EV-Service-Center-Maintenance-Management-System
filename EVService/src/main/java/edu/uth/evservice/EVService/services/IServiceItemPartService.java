package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.ServiceItemPartDto;
import edu.uth.evservice.EVService.requests.ServiceItemPartRequest;
import java.util.List;

public interface IServiceItemPartService {
    List<ServiceItemPartDto> getByServiceItem(Integer serviceItemId);
    ServiceItemPartDto add(ServiceItemPartRequest request);
    void delete(Integer id);
}
