package edu.uth.evservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.TechnicianCertificate;
import edu.uth.evservice.models.TechnicianCertificateId;

@Repository
public interface ITechnicianCertificateRepository
        extends JpaRepository<TechnicianCertificate, TechnicianCertificateId> {
    // Tìm tất cả chứng chỉ của một kỹ thuật viên
    List<TechnicianCertificate> findByTechnician_UserId(Integer technicianId);
    List<TechnicianCertificate> findByTechnician_Username(String username);
}