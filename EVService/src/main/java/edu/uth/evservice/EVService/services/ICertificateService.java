package edu.uth.evservice.EVService.services;

import edu.uth.evservice.EVService.dto.CertificateDto;
import edu.uth.evservice.EVService.requests.CertificateRequest;

import java.util.List;

public interface ICertificateService {
    List<CertificateDto> getAllCertificates();
    CertificateDto getCertificateById(Integer id);
    CertificateDto createCertificate(CertificateRequest request);
    CertificateDto updateCertificate(Integer id, CertificateRequest request);
    void deleteCertificate(Integer id);
}
