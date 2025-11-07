package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.PartDto;
import edu.uth.evservice.requests.PartRequest;
import edu.uth.evservice.services.IPartService;
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
    public PartDto getById(@PathVariable Integer id) {
        return partService.getPartById(id);
    }

    @PostMapping
    public PartDto create(@RequestBody PartRequest request) {
        return partService.createPart(request);
    }

    @PutMapping("/{id}")
    public PartDto update(@PathVariable Integer id, @RequestBody PartRequest request) {
        return partService.updatePart(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        partService.deletePart(id);
    }
}
