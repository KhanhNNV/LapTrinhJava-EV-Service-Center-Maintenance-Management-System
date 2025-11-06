package edu.uth.evservice.services;

import edu.uth.evservice.dtos.ServiceItemPartDto;
import edu.uth.evservice.requests.ServiceItemPartRequest;
import java.util.List;

public interface IServiceItemPartService {
    List<ServiceItemPartDto> getByServiceItem(Integer serviceItemId);
    ServiceItemPartDto add(ServiceItemPartRequest request);
    void delete(Integer id);
}
