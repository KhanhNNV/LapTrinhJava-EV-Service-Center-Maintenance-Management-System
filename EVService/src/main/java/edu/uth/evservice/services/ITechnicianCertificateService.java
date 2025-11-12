package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.requests.AddCertificateRequest;

public interface ITechnicianCertificateService {
    List<TechnicianCertificateDto> getMyCertificates(String technicianUsername);

    TechnicianCertificateDto addCertificateToMyProfile(AddCertificateRequest request, String technicianUsername);

    void removeCertificateFromMyProfile(Integer certificateId, String technicianUsername);
}