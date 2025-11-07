package edu.uth.evservice.services;

import edu.uth.evservice.dtos.CertificateDto;
import edu.uth.evservice.requests.CertificateRequest;

import java.util.List;

public interface ICertificateService {
    List<CertificateDto> getAllCertificates();
    CertificateDto getCertificateById(Integer id);
    CertificateDto createCertificate(CertificateRequest request);
    CertificateDto updateCertificate(Integer id, CertificateRequest request);
    void deleteCertificate(Integer id);
}
