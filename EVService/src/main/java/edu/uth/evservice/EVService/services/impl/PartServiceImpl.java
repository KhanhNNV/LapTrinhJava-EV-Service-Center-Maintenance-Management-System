package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.PartDto;
import edu.uth.evservice.EVService.model.Part;
import edu.uth.evservice.EVService.repositories.PartRepository;
import edu.uth.evservice.EVService.requests.PartRequest;
import edu.uth.evservice.EVService.services.IPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartServiceImpl implements IPartService {

    private final PartRepository partRepository;

    @Override
    public List<PartDto> getAllParts() {
        return partRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public PartDto getPartById(Long id) {
        Part part = partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found with ID: " + id));
        return mapToDTO(part);
    }

    @Override
    public PartDto createPart(PartRequest request) {
        Part part = Part.builder()
                .partName(request.getPartName())
                .unitPrice(request.getUnitPrice())
                .costPrice(request.getCostPrice())
                .build();
        return mapToDTO(partRepository.save(part));
    }

    @Override
    public PartDto updatePart(Long id, PartRequest request) {
        Part existing = partRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Part not found with ID: " + id));
        existing.setPartName(request.getPartName());
        existing.setUnitPrice(request.getUnitPrice());
        existing.setCostPrice(request.getCostPrice());
        return mapToDTO(partRepository.save(existing));
    }

    @Override
    public void deletePart(Long id) {
        partRepository.deleteById(id);
    }

    private PartDto mapToDTO(Part part) {
        return PartDto.builder()
                .partId(part.getPartId())
                .partName(part.getPartName())
                .unitPrice(part.getUnitPrice())
                .costPrice(part.getCostPrice())
                .build();
    }
}
