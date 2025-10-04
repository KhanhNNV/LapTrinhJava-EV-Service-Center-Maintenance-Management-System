package edu.uth.evservice.EVService.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.uth.evservice.EVService.model.ServiceCenter;

@Repository
public interface ServiceCenterRepository extends JpaRepository<ServiceCenter,Integer> {
}