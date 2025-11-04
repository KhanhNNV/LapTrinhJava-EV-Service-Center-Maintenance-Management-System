package edu.uth.evservice.repositories;

import edu.uth.evservice.models.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ICertificateRepository extends JpaRepository<Certificate, Integer> {
    Optional<Certificate> findByCertificateName(String certificateName);

}
