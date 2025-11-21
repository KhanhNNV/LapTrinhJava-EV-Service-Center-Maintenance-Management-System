package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.requests.AddCertificateRequest;
import edu.uth.evservice.requests.UpdateTechnicianCertificateRequest;

public interface ITechnicianCertificateService {
    List<TechnicianCertificateDto> getMyCertificates(Integer UserId);

    TechnicianCertificateDto addCertificateToMyProfile(AddCertificateRequest request, Integer UserId);

    void removeCertificateFromMyProfile(Integer certificateId, Integer UserId);

    List<TechnicianCertificateDto> getCertificatesByTechnicianId(Integer technicianId);

    TechnicianCertificateDto updateCertificateForTechnician(Integer technicianId, Integer certificateId, UpdateTechnicianCertificateRequest request);
}