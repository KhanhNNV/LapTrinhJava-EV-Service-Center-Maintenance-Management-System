package edu.uth.evservice.services.impl;

import java.util.List;
import java.util.stream.Collectors;

import edu.uth.evservice.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

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

    @Override
    public List<TechnicianCertificateDto> getCertificatesForTechnician(Integer technicianId) {
        return techCertRepository.findByTechnician_UserId(technicianId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TechnicianCertificateDto addCertificateToTechnician(Integer technicianId, AddCertificateRequest request) {
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found: " + technicianId));

        Certificate certificate = certificateRepository.findById(request.getCertificateId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + request.getCertificateId()));

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
            throw new ResourceNotFoundException("Technician certificate mapping not found.");
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