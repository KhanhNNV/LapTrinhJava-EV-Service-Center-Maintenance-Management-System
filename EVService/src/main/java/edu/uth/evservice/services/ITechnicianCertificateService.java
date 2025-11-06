package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.requests.AddCertificateRequest;

public interface ITechnicianCertificateService {
    List<TechnicianCertificateDto> getCertificatesForTechnician(Integer technicianId);

    TechnicianCertificateDto addCertificateToTechnician(Integer technicianId, AddCertificateRequest request);

    void removeCertificateFromTechnician(Integer technicianId, Integer certificateId);
}