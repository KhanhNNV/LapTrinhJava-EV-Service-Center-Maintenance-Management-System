package edu.uth.evservice.services.impl;

import java.time.LocalDate; // <-- Thêm import
import java.util.List;
import java.util.stream.Collectors;

// Bỏ import exception không dùng nữa
// import edu.uth.evservice.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- Thêm import

import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.models.Certificate;
import edu.uth.evservice.models.TechnicianCertificate;
import edu.uth.evservice.models.TechnicianCertificateId;
import edu.uth.evservice.models.User;
import edu.uth.evservice.repositories.ICertificateRepository;
import edu.uth.evservice.repositories.ITechnicianCertificateRepository;
import edu.uth.evservice.repositories.IUserRepository;
import edu.uth.evservice.requests.AddCertificateRequest;
import edu.uth.evservice.services.ITechnicianCertificateService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianCertificateServiceImpl implements ITechnicianCertificateService {

    private final ITechnicianCertificateRepository techCertRepository;
    private final IUserRepository userRepository;
    private final ICertificateRepository certificateRepository;

    private TechnicianCertificateDto toDto(TechnicianCertificate entity) {
        return TechnicianCertificateDto.builder()
                .technicianId(entity.getTechnician().getUserId())
                .certificateId(entity.getCertificate().getCertificateId())
                .certificateName(entity.getCertificate().getCertificateName())
                .issuingOrganization(entity.getCertificate().getIssuingOrganization())
                .issueDate(entity.getIssueDate())
                .expiryDate(entity.getExpiryDate())
                .credentialId(entity.getCredentialId())
                .build();
    }

    @Override
    @Transactional
    public TechnicianCertificateDto addCertificateToMyProfile(AddCertificateRequest request, String technicianUsername) {
        // 1. Tìm KTV (User) bằng username
        User technician = userRepository.findByUsername(technicianUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Technician: " + technicianUsername));

        // 2. Tìm Certificate (định nghĩa)
        Certificate certificate = certificateRepository.findById(request.getCertificateId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Certificate: " + request.getCertificateId()));

        // 3. Tạo ID tổng hợp
        TechnicianCertificateId id = new TechnicianCertificateId(technician.getUserId(), request.getCertificateId());

        // 4. Kiểm tra đã tồn tại chưa
        if (techCertRepository.existsById(id)) {
            throw new RuntimeException("Bạn đã có chứng chỉ này trong hồ sơ.");
        }
        
        // 5. Tính ngày hết hạn
        LocalDate expiryDate = request.getIssueDate().plusDays(certificate.getValidityPeriod());

        // 6. Xây dựng đối tượng TechnicianCertificate
        TechnicianCertificate techCert = TechnicianCertificate.builder()
                .id(id)
                .technician(technician)
                .certificate(certificate)
                .issueDate(request.getIssueDate())
                .expiryDate(expiryDate)
                .credentialId(request.getCredentialId())
                .notes(request.getNotes()) // Giả sử AddCertificateRequest đã được thêm trường 'notes'
                .build();

        return toDto(techCertRepository.save(techCert));
    }

    @Override
    public List<TechnicianCertificateDto> getMyCertificates(String technicianUsername) {
        // Repository của bạn không có findByTechnician_Username, 
        // vì vậy chúng ta phải dùng findByTechnician_UserId
        // (Giả sử ITechnicianCertificateRepository có findByTechnician_UserId)
        User technician = userRepository.findByUsername(technicianUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Technician: " + technicianUsername));

        return techCertRepository.findByTechnician_UserId(technician.getUserId()) // Sử dụng phương thức từ file cũ
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeCertificateFromMyProfile(Integer certificateId, String technicianUsername) {
        // 1. Tìm KTV (User) bằng username
        User technician = userRepository.findByUsername(technicianUsername)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Technician: " + technicianUsername));
        
        // 2. Tạo ID tổng hợp
        TechnicianCertificateId id = new TechnicianCertificateId(technician.getUserId(), certificateId);
        
        // 3. Kiểm tra tồn tại trước khi xóa
        if (!techCertRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy chứng chỉ này trong hồ sơ của bạn.");
        }
        
        // 4. Xóa
        techCertRepository.deleteById(id);
    }
}