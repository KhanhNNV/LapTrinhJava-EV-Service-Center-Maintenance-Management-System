package edu.uth.evservice.EVService.services.impl;

import edu.uth.evservice.EVService.dto.CertificateDto;
import edu.uth.evservice.EVService.model.Certificate;
import edu.uth.evservice.EVService.repositories.ICertificateRepository;
import edu.uth.evservice.EVService.requests.CertificateRequest;
import edu.uth.evservice.EVService.services.ICertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements ICertificateService {
    private final ICertificateRepository certificateRepository;

    @Override
    public List<CertificateDto> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CertificateDto getCertificateById(Integer id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found with id: " + id)); // Thay bằng ResourceNotFoundException
        return toDto(certificate);
    }

    @Override
    public CertificateDto createCertificate(CertificateRequest request) {
        certificateRepository.findByCertificateName(request.getCertificateName()).ifPresent(c -> {
            throw new IllegalArgumentException("Certificate with name '" + request.getCertificateName() + "' already exists.");
        });

        Certificate newCertificate = Certificate.builder()
                .certificateName(request.getCertificateName())
                .issuingOrganization(request.getIssuingOrganization())
                .description(request.getDescription())
                .validityPeriod(request.getValidityPeriod())
                .build();

        Certificate savedCertificate = certificateRepository.save(newCertificate);
        return toDto(savedCertificate);
    }

    @Override
    public CertificateDto updateCertificate(Integer id, CertificateRequest request) {
        Certificate existingCertificate = certificateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Certificate not found with id: " + id));

        existingCertificate.setCertificateName(request.getCertificateName());
        existingCertificate.setIssuingOrganization(request.getIssuingOrganization());
        existingCertificate.setDescription(request.getDescription());
        existingCertificate.setValidityPeriod(request.getValidityPeriod());

        Certificate updatedCertificate = certificateRepository.save(existingCertificate);
        return toDto(updatedCertificate);
    }

    @Override
    public void deleteCertificate(Integer id) {
        if (!certificateRepository.existsById(id)) {
            throw new RuntimeException("Certificate not found with id: " + id);
        }
        certificateRepository.deleteById(id);
    }

    private CertificateDto toDto(Certificate certificate) {
        return CertificateDto.builder()
                .certificateId(certificate.getCertificateId())
                .certificateName(certificate.getCertificateName())
                .issuingOrganization(certificate.getIssuingOrganization())
                .description(certificate.getDescription())
                .validityPeriod(certificate.getValidityPeriod())
                .build();
    }
}
