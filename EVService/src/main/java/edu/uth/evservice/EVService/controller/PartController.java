package edu.uth.evservice.EVService.controller;

import edu.uth.evservice.EVService.dto.PartDto;
import edu.uth.evservice.EVService.requests.PartRequest;
import edu.uth.evservice.EVService.services.IPartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final IPartService partService;

    @GetMapping
    public List<PartDto> getAll() {
        return partService.getAllParts();
    }

    @GetMapping("/{id}")
    public PartDto getById(@PathVariable Long id) {
        return partService.getPartById(id);
    }

    @PostMapping
    public PartDto create(@RequestBody PartRequest request) {
        return partService.createPart(request);
    }

    @PutMapping("/{id}")
    public PartDto update(@PathVariable Long id, @RequestBody PartRequest request) {
        return partService.updatePart(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        partService.deletePart(id);
    }
}
