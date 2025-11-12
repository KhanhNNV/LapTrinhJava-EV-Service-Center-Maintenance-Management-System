package edu.uth.evservice.controllers;
import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.requests.AddCertificateRequest;
import edu.uth.evservice.services.ITechnicianCertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/my-certificates") // API riêng cho KTV tự quản lý
@PreAuthorize("hasRole('TECHNICIAN')") // Bảo vệ toàn bộ API cho KTV
@RequiredArgsConstructor
public class MyCertificatesController {

    private final ITechnicianCertificateService techCertService;

    // 1. (Create) KTV thêm một chứng chỉ vào hồ sơ
    @PostMapping
    public ResponseEntity<TechnicianCertificateDto> addMyCertificate(
            @Valid @RequestBody AddCertificateRequest request, Authentication authentication) {
        
        Integer UserId = Integer.parseInt(authentication.getName());
        TechnicianCertificateDto newCert = techCertService.addCertificateToMyProfile(request, UserId);
        return new ResponseEntity<>(newCert, HttpStatus.CREATED);
    }


    // 2. (Read) KTV xem tất cả chứng chỉ của mình
    @GetMapping
    public ResponseEntity<List<TechnicianCertificateDto>> getMyCertificates(Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        return ResponseEntity.ok(techCertService.getMyCertificates(UserId));
    }

    // 3. (Delete) KTV xóa một chứng chỉ khỏi hồ sơ
    // Lưu ý: ID ở đây là ID của ĐỊNH NGHĨA chứng chỉ (certificateId)
    @DeleteMapping("/{certificateId}")
    public ResponseEntity<Void> removeMyCertificate(@PathVariable("certificateId") Integer certificateId, Authentication authentication) {
        Integer UserId = Integer.parseInt(authentication.getName());
        techCertService.removeCertificateFromMyProfile(certificateId, UserId);
        return ResponseEntity.noContent().build();
    }
}