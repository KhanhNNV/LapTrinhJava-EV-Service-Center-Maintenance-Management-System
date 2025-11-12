package edu.uth.evservice.controllers;

import edu.uth.evservice.dtos.CertificateDto;
import edu.uth.evservice.requests.CertificateRequest;
import edu.uth.evservice.services.ICertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates") // API chung cho chứng chỉ
@RequiredArgsConstructor
public class CertificateController {

    private final ICertificateService certificateService;

    // CREATE: Chỉ ADMIN mới có quyền tạo định nghĩa chứng chỉ
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificateDto> createCertificate(@Valid @RequestBody CertificateRequest request) {
        return new ResponseEntity<>(certificateService.createCertificate(request), HttpStatus.CREATED);
    }

    // UPDATE: Chỉ ADMIN mới có quyền sửa
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificateDto> updateCertificate(@PathVariable Integer id, @Valid @RequestBody CertificateRequest request) {
        return ResponseEntity.ok(certificateService.updateCertificate(id, request));
    }

    // DELETE: Chỉ ADMIN mới có quyền xóa
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Integer id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.noContent().build();
    }

    // READ ALL: KTV và Admin đều có thể xem danh sách
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<List<CertificateDto>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    // READ ONE: KTV và Admin đều có thể xem
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<CertificateDto> getCertificateById(@PathVariable Integer id) {
        return ResponseEntity.ok(certificateService.getCertificateById(id));
    }
}