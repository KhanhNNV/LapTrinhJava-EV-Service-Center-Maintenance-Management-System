package edu.uth.evservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.models.ServiceCenter;

@Repository
public interface IServiceCenterRepository extends JpaRepository<ServiceCenter,Integer> {
    boolean existsByCenterName(String centerName);
}