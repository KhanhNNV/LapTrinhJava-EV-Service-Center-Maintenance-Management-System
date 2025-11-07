package edu.uth.evservice.services;

import edu.uth.evservice.dtos.PartDto;
import edu.uth.evservice.requests.PartRequest;
import java.util.List;

public interface IPartService {
    List<PartDto> getAllParts();
    PartDto getPartById(Integer id);
    PartDto createPart(PartRequest request);
    PartDto updatePart(Integer id, PartRequest request);
    void deletePart(Integer id);
}
