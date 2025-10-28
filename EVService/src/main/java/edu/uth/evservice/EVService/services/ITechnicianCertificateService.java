package edu.uth.evservice.EVService.services;

import java.util.List;

import edu.uth.evservice.EVService.dto.TechnicianCertificateDto;
import edu.uth.evservice.EVService.requests.AddCertificateRequest;

public interface ITechnicianCertificateService {
    List<TechnicianCertificateDto> getCertificatesForTechnician(Integer technicianId);

    TechnicianCertificateDto addCertificateToTechnician(Integer technicianId, AddCertificateRequest request);

    void removeCertificateFromTechnician(Integer technicianId, Integer certificateId);
}
