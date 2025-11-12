package edu.uth.evservice.services;

import java.util.List;

import edu.uth.evservice.dtos.TechnicianCertificateDto;
import edu.uth.evservice.requests.AddCertificateRequest;

public interface ITechnicianCertificateService {
    List<TechnicianCertificateDto> getMyCertificates(Integer UserId);

    TechnicianCertificateDto addCertificateToMyProfile(AddCertificateRequest request, Integer UserId);

    void removeCertificateFromMyProfile(Integer certificateId, Integer UserId);
}