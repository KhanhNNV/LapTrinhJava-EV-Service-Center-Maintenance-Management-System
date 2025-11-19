package edu.uth.evservice.services.impl;

import edu.uth.evservice.dtos.CertificateDto;
import edu.uth.evservice.models.Certificate;
import edu.uth.evservice.repositories.ICertificateRepository;
import edu.uth.evservice.requests.CertificateRequest;
import edu.uth.evservice.services.ICertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements ICertificateService {
    private final ICertificateRepository certificateRepository;

    @Override
    public CertificateDto createCertificate(CertificateRequest request) {
        if (certificateRepository.existsByCertificateName(request.getCertificateName())) {
            throw new RuntimeException("Tên chứng chỉ đã tồn tại.");
        }
        
        Certificate cert = Certificate.builder()
                .certificateName(request.getCertificateName())
                .issuingOrganization(request.getIssuingOrganization())
                .description(request.getDescription())
                .validityPeriod(request.getValidityPeriod())
                .certificateType(request.getCertificateType())
                .build();
        
        return toDTO(certificateRepository.save(cert));
    }

    @Override
    public CertificateDto updateCertificate(Integer id, CertificateRequest request) {
        Certificate existingCert = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chứng chỉ với ID: " + id));

        existingCert.setCertificateName(request.getCertificateName());
        existingCert.setIssuingOrganization(request.getIssuingOrganization());
        existingCert.setDescription(request.getDescription());
        existingCert.setValidityPeriod(request.getValidityPeriod());
        
        return toDTO(certificateRepository.save(existingCert));
    }

    @Override
    public void deleteCertificate(Integer id) {
        if (!certificateRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy chứng chỉ với ID: " + id);
        }
        certificateRepository.deleteById(id);
    }

    @Override
    public List<CertificateDto> getAllCertificates() {
        return certificateRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public CertificateDto getCertificateById(Integer id) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chứng chỉ với ID: " + id));
        return toDTO(cert);
    }

    // --- HÀM HELPER ---
    private CertificateDto toDTO(Certificate cert) {
        return CertificateDto.builder()
                .certificateId(cert.getCertificateId())
                .certificateName(cert.getCertificateName())
                .issuingOrganization(cert.getIssuingOrganization())
                .description(cert.getDescription())
                .validityPeriod(cert.getValidityPeriod())
                .build();
    }
}
