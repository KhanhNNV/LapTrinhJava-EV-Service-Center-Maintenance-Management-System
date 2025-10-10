package edu.uth.evservice.EVService.repositories;

import edu.uth.evservice.EVService.model.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IServicePackageRepository extends JpaRepository<ServicePackage, Integer> {
}
