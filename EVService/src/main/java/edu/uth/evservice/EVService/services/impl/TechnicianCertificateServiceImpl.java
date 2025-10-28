package edu.uth.evservice.EVService.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import edu.uth.evservice.EVService.dto.TechnicianCertificateDto;
import edu.uth.evservice.EVService.model.Certificate;
import edu.uth.evservice.EVService.model.TechnicianCertificate;
import edu.uth.evservice.EVService.model.TechnicianCertificateId;
import edu.uth.evservice.EVService.model.User;
import edu.uth.evservice.EVService.repositories.ICertificateRepository;
import edu.uth.evservice.EVService.repositories.ITechnicianCertificateRepository;
import edu.uth.evservice.EVService.repositories.IUserRepository;
import edu.uth.evservice.EVService.requests.AddCertificateRequest;
import edu.uth.evservice.EVService.services.ITechnicianCertificateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianCertificateServiceImpl implements ITechnicianCertificateService {

    private final ITechnicianCertificateRepository techCertRepository;
    private final IUserRepository userRepository;
    private final ICertificateRepository certificateRepository;

    @Override
    public List<TechnicianCertificateDto> getCertificatesForTechnician(Integer technicianId) {
        return techCertRepository.findByTechnicianId(technicianId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TechnicianCertificateDto addCertificateToTechnician(Integer technicianId, AddCertificateRequest request) {
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new EntityNotFoundException("Technician not found: " + technicianId));

        Certificate certificate = certificateRepository.findById(request.getCertificateId())
                .orElseThrow(() -> new EntityNotFoundException("Certificate not found: " + request.getCertificateId()));

        TechnicianCertificate techCert = TechnicianCertificate.builder()
                .id(new TechnicianCertificateId(technicianId, request.getCertificateId()))
                .technician(technician)
                .certificate(certificate)
                .issueDate(request.getIssueDate())
                .expiryDate(request.getIssueDate().plusDays(certificate.getValidityPeriod()))
                .credentialId(request.getCredentialId())
                .notes("Verified") // Ghi chú mặc định
                .build();

        return toDto(techCertRepository.save(techCert));
    }

    @Override
    public void removeCertificateFromTechnician(Integer technicianId, Integer certificateId) {
        TechnicianCertificateId id = new TechnicianCertificateId(technicianId, certificateId);
        if (!techCertRepository.existsById(id)) {
            throw new EntityNotFoundException("Technician certificate mapping not found.");
        }
        techCertRepository.deleteById(id);
    }

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
}