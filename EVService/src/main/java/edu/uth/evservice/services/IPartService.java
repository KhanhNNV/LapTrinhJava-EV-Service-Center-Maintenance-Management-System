package edu.uth.evservice.services;

import edu.uth.evservice.dtos.PartDto;
import edu.uth.evservice.requests.AddStockRequest;
import edu.uth.evservice.requests.PartRequest;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface IPartService {
    PartDto createPart(PartRequest request);

    List<PartDto> getAllParts();

    PartDto getPartById(Integer partId);

    PartDto updatePart(Integer partId, PartRequest request);


    void deletePart(Integer partId);
}
