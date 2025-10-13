package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.PartDto;
import edu.uth.evservice.EVService.requests.PartRequest;
import java.util.List;

public interface IPartService {
    List<PartDto> getAllParts();
    PartDto getPartById(Long id);
    PartDto createPart(PartRequest request);
    PartDto updatePart(Long id, PartRequest request);
    void deletePart(Long id);
}
