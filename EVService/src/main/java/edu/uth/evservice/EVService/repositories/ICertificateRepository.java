package edu.uth.evservice.EVService.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.uth.evservice.EVService.model.Certificate;

public interface ICertificateRepository extends JpaRepository<Certificate, Integer> {
    Optional<Certificate> findByCertificateName(String certificateName);
}
