package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.Appointment;
import edu.uth.evservice.EVService.model.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ICertificateRepository extends JpaRepository<Certificate, Integer> {
    Optional<Certificate> findByCertificateName(String certificateName);

}
