package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.PartDto;
import edu.uth.evservice.EVService.requests.PartRequest;
import java.util.List;

public interface IPartService {
    List<PartDto> getAllParts();
    PartDto getPartById(Integer id);
    PartDto createPart(PartRequest request);
    PartDto updatePart(Integer id, PartRequest request);
    void deletePart(Integer id);
}
