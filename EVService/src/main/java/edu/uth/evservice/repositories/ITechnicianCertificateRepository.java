package edu.uth.evservice.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.TechnicianCertificate;
import edu.uth.evservice.models.TechnicianCertificateId;
import edu.uth.evservice.models.enums.CertificateType;

@Repository
public interface ITechnicianCertificateRepository
        extends JpaRepository<TechnicianCertificate, TechnicianCertificateId> {
    // Tìm tất cả chứng chỉ của một kỹ thuật viên
    List<TechnicianCertificate> findByTechnician_UserId(Integer technicianId);

    List<TechnicianCertificate> findByTechnician_Username(String username);

    // tim kiem theo loai chung chi va ngay het han sau ngay hien tai
    List<TechnicianCertificate> findByCertificate_CertificateTypeAndExpiryDateAfter(
            CertificateType certificateType,
            LocalDate today);
}