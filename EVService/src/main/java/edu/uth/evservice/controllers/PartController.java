package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.PartDto;
import edu.uth.evservice.requests.AddStockRequest;
import edu.uth.evservice.requests.PartRequest;
import edu.uth.evservice.services.IPartService;
import jakarta.persistence.criteria.CriteriaBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/parts")
@RequiredArgsConstructor
public class PartController {

    private final IPartService partService;

    // Tạo một phụ tùng mới và khởi tạo tồn kho
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartDto> createPart(@RequestBody PartRequest partRequest) {
        PartDto newPart = partService.createPart(partRequest);
        return new ResponseEntity<>(newPart, HttpStatus.CREATED);
    }

    // Lấy danh sách phụ tùng
    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN','STAFF','ADMIN')")
    public ResponseEntity<List<PartDto>> getAllParts() {
        return new ResponseEntity<>(partService.getAllParts(), HttpStatus.OK);
    }

    //Lấy thông tin một phụ tùng theo id
    @GetMapping("/{partId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN','STAFF','ADMIN')")
    public ResponseEntity<PartDto> getPartById(@PathVariable("partId") Integer partId) {
        return new ResponseEntity<>(partService.getPartById(partId), HttpStatus.OK);
    }

    //Cập nhập thông tin một phụ tùng theo Id
    @PutMapping("/{partId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartDto> updatePartDetails(
            @PathVariable Integer partId,
            @RequestBody PartRequest request) {
        // Trường 'initialStock' trong request sẽ bị bỏ qua
        PartDto updatedPart = partService.updatePart(partId, request);
        return ResponseEntity.ok(updatedPart);
    }


    // xóa 1 phụ tùng
    @DeleteMapping("/{partId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePart(@PathVariable Integer partId) {
        partService.deletePart(partId);
        return ResponseEntity.noContent().build();
    }
}
